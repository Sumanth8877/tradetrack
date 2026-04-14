import { SettingsPage } from "@/components/workspace/workspace-settings-page";
import { getDeepSeekSettingsSummary } from "@/lib/deepseek-settings";

export default async function SettingsRoute() {
  const apiKeySummary = await getDeepSeekSettingsSummary();

  return <SettingsPage apiKeySummary={apiKeySummary} />;
}
