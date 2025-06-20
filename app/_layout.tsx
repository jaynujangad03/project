import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="mounts"
        options={{
          headerShown: false,
        }}
      />
      {/* Hide header for all screens in (auth), (dashboard), (entry), (calendar), (trends), (settings) */}
      <Stack.Screen
        name="(auth)/login"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(auth)/register"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(dashboard)/home"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(entry)/entry"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(calendar)/calendar"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(trends)/trends"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(settings)/settings"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(dashboard)/history"
        options={{ headerShown: false }}
        />
      <Stack.Screen
        name="(dashboard)/weekly-summary"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(dashboard)/gallery"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(dashboard)/trends"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(dashboard)/settings"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(dashboard)/music-therapy"
        options={{ headerShown: false }}
      />
    </Stack>
    
  );
}