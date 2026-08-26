import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { CheckIcon, CommandLineIcon, AdjustmentsHorizontalIcon, FolderIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface SettingsData {
  dsa_repo_path: string;
  import_source: string;
  theme: string;
  editor_path: string;
  workspace_base: string;
}

const SETTINGS_KEY = "dsa_settings";
const defaultSettings: SettingsData = {
  dsa_repo_path: "",
  import_source: "striver",
  theme: "light",
  editor_path: "",
  workspace_base: "",
};

async function fetchSettings(): Promise<SettingsData> {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

async function updateSettings(updates: Partial<SettingsData>): Promise<SettingsData> {
  const current = await fetchSettings();
  const merged = { ...current, ...updates };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  return merged;
}

function SettingsField({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[15px] font-bold text-theme-text">{label}</label>
      {description && (
        <p className="text-[14px] font-medium text-theme-muted mb-2">{description}</p>
      )}
      {children}
    </div>
  );
}

export default function Settings() {
  const queryClient = useQueryClient();
  const [showToast, setShowToast] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<SettingsData>({
    values: data,
  });

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (updated) => {
      queryClient.setQueryData(["settings"], updated);
      reset(updated);
      setShowToast(true);
    },
  });

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const inputClasses =
    "w-full px-5 py-3.5 text-[15px] bg-theme-card border border-theme-border-strong rounded-[16px] shadow-sm " +
    "text-theme-text placeholder:text-theme-text-dim font-mono font-medium " +
    "focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary " +
    "transition-colors";

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-6 animate-fade-in pb-12 pt-4 w-full">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-theme-text mb-2">Settings</h1>
          <p className="text-theme-muted text-lg font-medium">Configure your application preferences.</p>
        </header>
        <div className="bg-theme-card rounded-[24px] border border-theme-border-strong shadow-softer p-8">
          <div className="h-6 w-32 bg-theme-surface-muted rounded mb-4 animate-pulse" />
          <div className="h-4 w-64 bg-theme-surface-muted rounded mb-6 animate-pulse" />
          <div className="h-12 w-full bg-theme-surface-muted rounded mb-6 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in pb-12 pt-4 w-full">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-theme-text mb-2">Settings</h1>
        <p className="text-theme-muted text-lg font-medium">Manage your local repository path and preferences.</p>
      </header>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <div className="bg-theme-card rounded-[24px] border border-theme-border-strong shadow-softer overflow-hidden">
          <div className="p-8 sm:p-10 space-y-10">
            {/* Section 1: Repository */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-[16px] bg-theme-surface-muted border border-theme-border-strong flex items-center justify-center shadow-sm">
                  <FolderIcon className="w-6 h-6 text-theme-text" />
                </div>
                <h3 className="text-[20px] font-bold text-theme-text">Repository Configuration</h3>
              </div>
              
              <div className="space-y-6 bg-theme-surface-muted/50 p-6 rounded-[20px] border border-theme-border-strong">
                <SettingsField
                  label="DSA Repository Path"
                  description="Absolute path to your local DSA practice repository."
                >
                  <input
                    {...register("dsa_repo_path")}
                    placeholder="/Users/username/Projects/dsa"
                    className={inputClasses}
                  />
                </SettingsField>
              </div>
            </div>

            <hr className="border-theme-border-strong" />

            {/* Section 2: Editor & Theme */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-[16px] bg-theme-surface-muted border border-theme-border-strong flex items-center justify-center shadow-sm">
                  <AdjustmentsHorizontalIcon className="w-6 h-6 text-theme-text" />
                </div>
                <h3 className="text-[20px] font-bold text-theme-text">Preferences</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <SettingsField
                  label="Editor Path"
                  description="Path to your code editor executable."
                >
                  <input
                    {...register("editor_path")}
                    placeholder="/usr/local/bin/code"
                    className={inputClasses}
                  />
                </SettingsField>

                <SettingsField
                  label="Theme"
                  description="Application visual theme."
                >
                  <select
                    {...register("theme")}
                    className={inputClasses + " appearance-none cursor-pointer font-sans font-bold text-[15px]"}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%237A7571' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 1rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em"
                    }}
                  >
                    <option value="light">Light</option>
                    <option value="dark" disabled>Dark (Coming Soon)</option>
                  </select>
                </SettingsField>
              </div>
              
              <SettingsField
                label="Import Source URL"
                description="Remote URL to fetch the problem sheet definitions from."
              >
                <input
                  {...register("import_source")}
                  placeholder="https://raw.githubusercontent.com/..."
                  className={inputClasses}
                />
              </SettingsField>
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-8 sm:p-10 bg-theme-surface-muted/50 border-t border-theme-border-strong flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              {/* Keyboard Shortcuts Reference */}
              <button
                type="button"
                className="flex items-center gap-2 text-[14px] font-bold text-theme-muted hover:text-theme-text transition-colors bg-theme-card px-5 py-2.5 rounded-[12px] shadow-sm border border-theme-border-strong"
                onClick={() => {
                  const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
                  document.dispatchEvent(event);
                }}
              >
                <CommandLineIcon className="w-5 h-5" />
                <span>View Keyboard Shortcuts (⌘K)</span>
              </button>
            </div>
            <button
              type="submit"
              disabled={!isDirty || mutation.isPending}
              className={`px-8 py-3.5 rounded-full font-bold shadow-sm transition-all text-[15px] ${
                !isDirty || mutation.isPending
                  ? "bg-theme-surface-muted text-theme-text-dim border border-transparent cursor-not-allowed"
                  : "bg-theme-text text-white hover:bg-theme-muted"
              }`}
            >
              {mutation.isPending ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </form>

      {/* Floating Toast Notification */}
      <div 
        className={`fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 bg-pastel-mint border border-theme-border-strong text-brand-primary-dark rounded-[20px] shadow-soft transition-all duration-300 transform z-50 ${
          showToast ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
        }`}
      >
        <div className="w-8 h-8 bg-theme-card rounded-full flex items-center justify-center shadow-sm">
          <CheckIcon className="w-5 h-5 stroke-[3]" />
        </div>
        <span className="text-[15px] font-bold">Settings saved successfully</span>
      </div>
    </div>
  );
}
