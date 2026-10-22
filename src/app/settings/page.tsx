'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { Switch } from '@/components/ui/Switch';
import { getData, exportData, importData, setDailyGoal, getDailyGoal, subscribeToData } from '@/lib/storage';
import { formatTime } from '@/lib/types';
import { Download, Upload, Trash2, Database, Palette, Bell, Target, Save, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function SettingsPage() {
  const [dailyGoal, setDailyGoalState] = useState(getDailyGoal());
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = () => {
    setExporting(true);
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const success = importData(result);
        if (success) {
          setImportMessage({ type: 'success', text: 'Data imported successfully! Page will reload.' });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setImportMessage({ type: 'error', text: 'Invalid backup file format.' });
        }
      } catch {
        setImportMessage({ type: 'error', text: 'Failed to read file.' });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
      if (confirm('This will permanently delete all courses, topics, sessions, and settings. Are you absolutely sure?')) {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  const handleSaveGoal = () => {
    setDailyGoal(dailyGoal);
    setImportMessage({ type: 'success', text: 'Daily goal updated!' });
    setTimeout(() => setImportMessage(null), 2000);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--foreground))]">Settings</h1>
          <p className="mt-2 text-[rgb(var(--muted-foreground))]">Customize your study tracker experience</p>
        </div>

        {/* Appearance */}
        <Card className="animate-in mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-[rgb(var(--primary))]" />
              Appearance
            </CardTitle>
            <CardDescription>Choose your preferred theme and visual style</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSwitcher />
          </CardContent>
        </Card>

        {/* Study Goals */}
        <Card className="animate-in mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[rgb(var(--primary))]" />
              Study Goals
            </CardTitle>
            <CardDescription>Set your daily study target</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="label">Daily Study Goal</label>
                <Input
                  type="number"
                  min="5"
                  max="480"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoalState(Math.max(5, Math.min(480, parseInt(e.target.value) || 5)))}
                  className="max-w-xs"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))]">
                <span>Current: {formatTime(getDailyGoal())}</span>
              </div>
            </div>
            <Button onClick={handleSaveGoal} disabled={dailyGoal === getDailyGoal()}>
              <Save className="h-4 w-4" />
              Save Goal
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="animate-in mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[rgb(var(--primary))]" />
              Notifications
            </CardTitle>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NotificationToggle label="Study Reminders" description="Get reminded to study at your preferred time" defaultChecked />
            <NotificationToggle label="Streak Alerts" description="Notify when your revision streak is at risk" defaultChecked />
            <NotificationToggle label="Goal Achieved" description="Celebrate when you hit your daily goal" defaultChecked />
            <NotificationToggle label="Weekly Summary" description="Receive a weekly progress report" />
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="animate-in mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-[rgb(var(--primary))]" />
              Data Management
            </CardTitle>
            <CardDescription>Backup, restore, or clear your study data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="secondary" onClick={handleExport} isLoading={exporting} className="w-full">
                <Download className="h-4 w-4" />
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Export Data'}
              </Button>
              <div className="relative">
                <Button variant="secondary" onClick={() => document.getElementById('import-file')?.click()} className="w-full">
                  <Upload className="h-4 w-4" />
                  Import Data
                </Button>
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  className="sr-only"
                  onChange={handleImport}
                />
              </div>
            </div>

            {importMessage && (
              <div className={clsx(
                'p-3 rounded-lg text-sm',
                importMessage.type === 'success'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}>
                {importMessage.text}
              </div>
            )}

            <div className="pt-4 border-t border-[rgb(var(--border))]">
              <p className="text-sm text-[rgb(var(--muted-foreground))] mb-3">
                Danger Zone: This action cannot be undone.
              </p>
              <Button variant="danger" onClick={handleClearAllData} className="w-full sm:w-auto">
                <Trash2 className="h-4 w-4" />
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="animate-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-[rgb(var(--primary))]" />
              About
            </CardTitle>
            <CardDescription>Application information and version</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[rgb(var(--border))]">
              <span className="text-[rgb(var(--muted-foreground))]">Version</span>
              <span className="font-mono text-[rgb(var(--foreground))]">1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[rgb(var(--border))]">
              <span className="text-[rgb(var(--muted-foreground))]">Data Storage</span>
              <span className="font-mono text-[rgb(var(--foreground))]">LocalStorage (Browser)</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[rgb(var(--muted-foreground))]">Tech Stack</span>
              <span className="font-mono text-[rgb(var(--foreground))]">Next.js 14, React 18, Tailwind CSS</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

interface NotificationToggleProps {
  label: string;
  description: string;
  defaultChecked?: boolean;
}

function NotificationToggle({ label, description, defaultChecked = false }: NotificationToggleProps) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <p className="font-medium text-[rgb(var(--foreground))]">{label}</p>
        <p className="text-sm text-[rgb(var(--muted-foreground))]">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={setChecked} />
    </div>
  );
}