# Development

## NPM configuration

Configure private NPM feed. Add the following to `~/.npmrc`.

```
; begin auth token
//devdiv.pkgs.visualstudio.com/_packaging/VS/npm/registry/:username=devdiv
//devdiv.pkgs.visualstudio.com/_packaging/VS/npm/registry/:_password={base64-ed PAT}
//devdiv.pkgs.visualstudio.com/_packaging/VS/npm/registry/:email=npm requires email to be set but doesn't use the value
//devdiv.pkgs.visualstudio.com/_packaging/VS/npm/:username=devdiv
//devdiv.pkgs.visualstudio.com/_packaging/VS/npm/:_password={base64-ed PAT}
//devdiv.pkgs.visualstudio.com/_packaging/VS/npm/:email=npm requires email to be set but doesn't use the value
; end auth token
```

## Watch mode for development

- Run `npm run watch`
- Launch the extension development host
- Code changes should reflect after a "reload window" on the extension host
