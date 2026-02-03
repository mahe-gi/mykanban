# Teams App Package Instructions

## Files Created

Your Microsoft Teams app package is ready:

```
manifest/
  ├── manifest.json       (Teams app definition)
  ├── icon-color.png      (192x192 color icon)
  └── icon-outline.png    (32x32 outline icon)
```

**App ID**: `b6f08e4b-259a-41c3-8854-b7708ff3452a` (stable, never change)

## Before Creating Package

⚠️ **Update manifest.json** with your actual hosting URL:

1. Replace `https://localhost:3000` with your ngrok/production URL
2. Update `validDomains` array
3. Update `configurationUrl` in `configurableTabs`

Example for ngrok:
```json
"configurationUrl": "https://abc123.ngrok.io/config",
"validDomains": ["abc123.ngrok.io"]
```

## Create Teams App Package

```bash
cd manifest
zip ../kanban-teams-app.zip manifest.json icon-color.png icon-outline.png
```

This creates `kanban-teams-app.zip` in the project root.

## Upload to Microsoft Teams

### Method 1: Teams Desktop/Web Client
1. Open Microsoft Teams
2. Click **Apps** in the left sidebar
3. Click **Manage your apps**
4. Click **Upload an app** → **Upload a custom app**
5. Select `kanban-teams-app.zip`
6. Click **Add** to add to a team or channel

### Method 2: Teams Admin Center (Enterprise)
1. Go to https://admin.teams.microsoft.com
2. Navigate to **Teams apps** → **Manage apps**
3. Click **Upload new app**
4. Upload `kanban-teams-app.zip`
5. Set approval policies

## Add App to a Channel

1. Navigate to any Teams channel
2. Click the **+** tab button
3. Search for "Kanban Board"
4. Click your custom app
5. Complete the configuration page
6. Click **Save**

## Validation Checklist

Before uploading:
- [ ] Manifest version is 1.17 (2026 schema)
- [ ] GUID is stable and never changes
- [ ] `validDomains` matches your hosting URL
- [ ] `configurationUrl` points to your `/config` page
- [ ] Icons are exactly 192x192 (color) and 32x32 (outline)
- [ ] ZIP contains exactly 3 files: manifest.json + 2 icons

## Troubleshooting

**"App package is invalid"**
- Verify manifest.json syntax with `cat manifest.json | jq .`
- Check icon dimensions with `file icon-*.png`
- Ensure ZIP contains no extra folders

**"Cannot load configuration page"**
- Verify HTTPS hosting is active
- Check `configurationUrl` matches your `/config` route
- Ensure domain is in `validDomains`

**"App not appearing in search"**
- Custom apps may take 1-2 minutes to appear
- Check tenant allows custom app uploads (admin setting)
- Try refreshing Teams client

## Next Steps

After successful upload:
1. Add app to a test channel
2. Verify configuration page loads
3. Proceed to **EPIC 2** - Kanban Web App Shell
