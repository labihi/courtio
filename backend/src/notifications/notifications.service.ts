import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as webpush from 'web-push';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { PushSubscriptionDto } from './dto/push-subscription.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const email = process.env.VAPID_EMAIL ?? 'mailto:admin@courtio.app';
    if (publicKey && privateKey) {
      webpush.setVapidDetails(email, publicKey, privateKey);
    }
  }

  async subscribe(userId: string, subscription: PushSubscriptionDto): Promise<void> {
    await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $pull: { pushSubscriptions: { endpoint: subscription.endpoint } } },
    );
    await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $push: { pushSubscriptions: subscription } },
    );
  }

  async unsubscribe(userId: string, endpoint: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $pull: { pushSubscriptions: { endpoint } } },
    );
  }

  async getMyNotifications(userId: string): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ recipient: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async markRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationModel.updateOne(
      { _id: new Types.ObjectId(notificationId), recipient: new Types.ObjectId(userId) },
      { read: true },
    );
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { recipient: new Types.ObjectId(userId), read: false },
      { read: true },
    );
  }

  async notifyAll(
    type: NotificationType,
    title: string,
    body: string,
    data: Record<string, string> = {},
  ): Promise<void> {
    const users = await this.userModel.find({}, '_id pushSubscriptions').lean().exec();
    if (!users.length) return;

    const notifications = users.map((u) => ({
      recipient: u._id,
      type,
      title,
      body,
      data,
      read: false,
    }));
    await this.notificationModel.insertMany(notifications);

    const payload = JSON.stringify({ title, body, data });
    const pushPromises = users.flatMap((u) =>
      (u.pushSubscriptions ?? []).map((sub) =>
        webpush
          .sendNotification(sub as webpush.PushSubscription, payload)
          .catch((err) => {
            if (err.statusCode === 404 || err.statusCode === 410) {
              this.userModel
                .updateOne({ _id: u._id }, { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } })
                .catch(() => {});
            } else {
              this.logger.warn(`Push failed for ${sub.endpoint}: ${err.message}`);
            }
          }),
      ),
    );
    await Promise.allSettled(pushPromises);
  }
}
