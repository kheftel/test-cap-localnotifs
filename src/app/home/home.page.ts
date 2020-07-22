import { Component, OnInit } from '@angular/core';
import { DataService, Message } from '../services/data.service';
import { Plugins, NotificationPermissionResponse, LocalNotificationPendingList, LocalNotification } from "@capacitor/core";
const { LocalNotifications } = Plugins;
import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  notifId = 1;

  constructor(private data: DataService) { }

  addNotification(on: {
    month?: number,
    day?: number,
    hour?: number,
    minute?: number
  }, extraTitleText, notifs) {
    notifs.push({
      title: 'notification id ' + this.notifId + ' ' + extraTitleText,
      body: JSON.stringify(on),
      id: this.notifId,
      schedule: {
        on: on
      },
    });
    this.notifId++;
  }

  ngOnInit() {

    LocalNotifications.requestPermission().then((res: NotificationPermissionResponse) => {
      if (res.granted) {

        LocalNotifications.getPending()
          .then((list: LocalNotificationPendingList) => {
            if (list.notifications.length > 0) {
              return LocalNotifications.cancel(list);
            }
            return null;
          })
          .then(() => {
            var now = new Date();

            var notifs:LocalNotification[] = [];
            var minutes = [-1, 1];
            var hours = [-1, 0, 1];
            var days = [-1, 0, 1];
            var months = [-1, 0, 1];

            // hourly repeating
            minutes.forEach(m => {
              this.addNotification({
                minute: moment().add({ minute: m }).toDate().getMinutes()
              }, `m: ${m}`, notifs);
            });

            // daily repeating
            hours.forEach(h => {
              minutes.forEach(m => {
                this.addNotification({
                  hour: moment().add({ hour: h }).toDate().getHours(),
                  minute: moment().add({ minute: m }).toDate().getMinutes(),
                }, `h: ${h}, m: ${m}`, notifs);
              });
            });

            // monthly repeating
            days.forEach(d => {
              hours.forEach(h => {
                minutes.forEach(m => {
                  this.addNotification({
                    day: moment().add({ day: d }).toDate().getDate(),
                    hour: moment().add({ hour: h }).toDate().getHours(),
                    minute: moment().add({ minute: m }).toDate().getMinutes(),
                  }, `d: ${d}, h: ${h}, m: ${m}`, notifs);
                });
              });
            });

            console.log('scheduling notifications:' + JSON.stringify(notifs, null, 2));
            notifs.forEach(n => {
              console.log(n.id + ': ' + n.title + ', ' + JSON.stringify(n.schedule.on, null, 2));
            })

            return LocalNotifications.schedule({
              notifications: notifs
            })
          });
      }

      //     if (this.userData) {
      //       var notifications = [];
      //       this.cancelLocalNotifications()
      //         .then(() => {
      //           // build the list of notifications to schedule
      //           Object.keys(this.userData.prefs)
      //             .forEach(k => {
      //               if (k.indexOf('notify') === 0 && this.userData.prefs[k]) {
      //                 let time = k.substr(6); //2am
      //                 var hour = parseInt(time.charAt(0));
      //                 if (time.charAt(1) === 'p')
      //                   hour += 12;
      //                 notifications.push(this.getNotificationData(hour, 30));
      //               }
      //             });
      //           console.log('firebaseservice: scheduling notifications: ' + JSON.stringify(notifications, null, 2));
      //           LocalNotifications.schedule({
      //             notifications: notifications
      //           })
      //             .then(notifs => {
      //               console.log('firebaseservice: scheduled notifications: ' + JSON.stringify(notifs, null, 2));
      //             })
      //             .catch(err => {
      //               console.log('firebaseservice: notification error: ' + JSON.stringify(err, null, 2));
      //             });
      //         });
      //     }
      //     else {
      //       this.cancelLocalNotifications();
      //     }
      //   }
      //   else {
      //     console.log('firebaseservice: notifications not enabled');
      //     // alert('Please go to your device settings to enable notifications');
      //   }
      // });

    });
  }

  getMessages(): Message[] {
    return this.data.getMessages();
  }

}
