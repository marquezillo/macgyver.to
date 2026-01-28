import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/lib/translations";
import { ArrowLeft, Moon, Sun, Monitor, Bell, Shield, Palette, Globe } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [notifications, setNotifications] = useState(true);

  const handleThemeChange = () => {
    if (toggleTheme) {
      toggleTheme();
      toast.success(t("common.success"));
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    toast.success(t("common.success"));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t("settings.title")}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.subtitle")}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle>{t("settings.appearance")}</CardTitle>
                <CardDescription>{t("settings.appearance")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("settings.theme")}</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("settings.theme")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={handleThemeChange}
                  className="gap-2"
                >
                  <Sun className="w-4 h-4" />
                  {t("settings.light")}
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={handleThemeChange}
                  className="gap-2"
                >
                  <Moon className="w-4 h-4" />
                  {t("settings.dark")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>{t("settings.language")}</CardTitle>
                <CardDescription>{t("settings.language")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("settings.interfaceLanguage")}</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("settings.selectLanguage")}
                </p>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle>{t("settings.notifications")}</CardTitle>
                <CardDescription>{t("settings.notifications")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("settings.pushNotifications")}</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("settings.receiveNotifications")}
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle>{t("settings.privacy")}</CardTitle>
                <CardDescription>{t("settings.privacy")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("settings.saveHistory")}</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("settings.keepRecord")}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("settings.longTermMemory")}</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("settings.allowMemory")}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/settings/memory">
            <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t("settings.manageMemory")}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.configureMemory")}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/account">
            <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t("settings.myAccount")}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.profilePassword")}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
