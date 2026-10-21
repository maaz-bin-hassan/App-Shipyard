import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{{appName}}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "{{primaryColor}}",
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
  },
});
