# DC Metro Google Action 🚉 🔉
This is a custom action for the Google Assistant which will tell you the current rail and bus predictions for the DC Metro transit system. These actions can be invoked on anything that supports Google Assistant such as a phone, a Google Home device, and the app.

## Installation Steps 💽
This application can be installed with Yarn by running `yarn install` from within the [functions](/functions) directory. With the dependencies installed you can deploy compile and lint the codebase using the `tsc` command.

---

### Deploying
This project can be deployed to firebase using the `firebase deploy -only functions` command. If you'd like to import the project directly into Google Home you can use follow the steps below.

...


## Interactions 💬
You're able to invoke the application using Google Assistant by saying `Hey Google, talk to DC Metro`. Once the connection has been established you're able to ask it a series of questions.


| Action | Description |
| ------------- | ------------- |
| Train Timetable  | You can ask the action for a rail or train timetable at a specific station. For instance you can say `Rail timetable for Farragut North` or `Train timetable for U Street`. Stations with acronyms in their name will also work, for example `Train timetable for George Mason University`. 
