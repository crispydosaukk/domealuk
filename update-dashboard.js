const fs = require('fs');
let code = fs.readFileSync('src/app/admin-settings/page.tsx', 'utf8');

// 1. Add adminEmails to defaultSettings
if (!code.includes('adminEmails: [')) {
  code = code.replace(
    '  // Referral',
    `  // Email Settings\n  adminEmails: [\n    { email: 'Digitalbotsolutions@gmail.com', enabled: true },\n    { email: 'rahulbadugu22@gmail.com', enabled: true }\n  ],\n\n  // Referral`
  );
}

// 2. Add 'email' to tabs
if (!code.includes("id: 'email'")) {
  code = code.replace(
    /(\{\s*id:\s*'qrcode',\s*label:\s*'Website QR Code',\s*icon:\s*QrCode,\s*color:\s*'text-emerald-600',\s*bg:\s*'bg-emerald-50',\s*\},\s*)(\];)/,
    `$1    {\n      id: 'email',\n      label: 'Email Settings',\n      icon: Users,\n      color: 'text-indigo-600',\n      bg: 'bg-indigo-50',\n    },\n  $2`
  );
}

// 3. Add activeTab === 'email' JSX block
if (!code.includes("activeTab === 'email'")) {
  const emailJsx = `
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="text-indigo-600" size={20} />
                  Admin Email Notifications
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage the list of admin emails that receive notifications for new registrations, corporate inquiries, and orders.
                </p>
                <div className="space-y-4">
                  {(settings.adminEmails || []).map((admin, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <input
                        type="email"
                        value={admin.email}
                        onChange={(e) => {
                          const newEmails = [...settings.adminEmails];
                          newEmails[idx].email = e.target.value;
                          setSettings({ ...settings, adminEmails: newEmails });
                        }}
                        className="flex-1 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="admin@example.com"
                      />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={admin.enabled}
                          onChange={(e) => {
                            const newEmails = [...settings.adminEmails];
                            newEmails[idx].enabled = e.target.checked;
                            setSettings({ ...settings, adminEmails: newEmails });
                          }}
                          className="w-5 h-5 rounded text-primary focus:ring-primary/20 border-gray-300"
                        />
                        <span className="text-sm font-medium">Enabled</span>
                      </label>
                      <button
                        onClick={() => {
                          const newEmails = [...settings.adminEmails];
                          newEmails.splice(idx, 1);
                          setSettings({ ...settings, adminEmails: newEmails });
                        }}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newEmails = [...(settings.adminEmails || []), { email: '', enabled: true }];
                      setSettings({ ...settings, adminEmails: newEmails });
                    }}
                    className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors py-2 px-4 bg-primary/5 rounded-xl hover:bg-primary/10"
                  >
                    <Plus size={16} />
                    Add Email Address
                  </button>
                </div>
              </div>
            </div>
          )}
`;
  
  // Find where the first activeTab is rendered and inject before it
  code = code.replace(
    /(\{activeTab === 'referral' && \()/g,
    emailJsx + '\n          $1'
  );
}

fs.writeFileSync('src/app/admin-settings/page.tsx', code);
console.log('Updated admin settings page successfully!');
