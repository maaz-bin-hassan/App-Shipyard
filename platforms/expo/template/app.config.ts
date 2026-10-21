const config = {
  name: "{{appName}}",
  slug: "{{appName}}",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  ios: {
    bundleIdentifier: "{{applicationId}}",
    supportsTablet: true,
    infoPlist: {
      NSCameraUsageDescription:
        "The camera lets you take a photo in the app, for example a profile picture or a scan.",
      NSPhotoLibraryUsageDescription: "Photo access lets you choose a picture you already have and attach it.",
      NSLocationWhenInUseUsageDescription: "Location lets the app show nearby results and set your place on the map.",
      NSMicrophoneUsageDescription: "The microphone lets you record a voice message in the app.",
      NSContactsUsageDescription: "Contacts lets you pick a person to invite without typing their details.",
      NSCalendarsUsageDescription: "Calendar access lets the app add an event you create to your calendar.",
      NSBluetoothAlwaysUsageDescription: "Bluetooth lets the app connect to a nearby device it works with.",
    },
  },
  android: {
    package: "{{applicationId}}",
    permissions: [
      "android.permission.CAMERA",
      "android.permission.READ_MEDIA_IMAGES",
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.RECORD_AUDIO",
      "android.permission.READ_CONTACTS",
      "android.permission.READ_CALENDAR",
      "android.permission.WRITE_CALENDAR",
      "android.permission.BLUETOOTH_CONNECT",
      "android.permission.POST_NOTIFICATIONS",
    ],
  },
  plugins: [
    "expo-localization",
    "expo-camera",
    "expo-image-picker",
    "expo-location",
    "expo-audio",
    "expo-contacts",
    "expo-calendar",
    "expo-notifications",
  ],
};

export default config;
