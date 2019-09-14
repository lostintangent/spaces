# Live Share Spaces

[![Join space](https://vslscommunitieswebapp.azurewebsites.net/badge/vsls)](http://vslscommunitieswebapp.azurewebsites.net/join_redirect/vsls) [![Join space](https://vslscommunitieswebapp.azurewebsites.net/badge/vsls?insiders)](http://vslscommunitieswebapp.azurewebsites.net/join_redirect/vsls?insiders)

Live Share Spaces enables you to join one or more "spaces", and begin discovering, communicating and collaborating with other developers in real-time. A "space" is nothing more than a name, that allows you to find other people that share common interests and/or context (almost like a Twitter hash tag). A space can represent a team, ad-hoc group (e.g. a hack-a-thon team, a classroom), a language/framework ecosystem (e.g. `elixir`, `redux`), an online forum (e.g. `dev.to/javascript`) and everything in-between. Since spaces can represent literally anything, they can be as broad or as focused as neccessary, as long as they help faciliate meaningful collaboration.

Once you join a space, you can chat with other members, invite them into collaboration sessions, ask for help and even live stream anything cool that you're working on. All of this is built-in top of [Live Share](https://aka.ms/vsls), which provides a full-fidelity developer collaboration platform (e.g. co-editing, debugging, localhost server, etc.).

## Getting Started

To begin joining spaces, simply perform the following steps:

1. Install <a href="https://aka.ms/vsls-spaces" target="_blank">this extension</a>, then reload VS Code

1. Open the Live Share activity bar, and look for the `Spaces` tree view. Click the `Sign in with Live Share...` link and complete the sign in flow, using a GitHub or Microsoft Account.

   > If you're already using Live Share then you won't need to sign in again. Signing in is required so that other space members can idenitify who you are.

1. Click the `Join a space...` link and then type the space name you'd like to join (e.g. `redux`, `python`) or select a popular one from the list

   <img width="600px"  src="https://user-images.githubusercontent.com/116461/62503259-44501b00-b7a8-11e9-9434-f96b17ab5dc7.png">

   > Alternatively, if you see a GitHub repo or web page with a `Live Share Space` badge (like you see at the top of this readme), you can simply click that in order to join it's respective space.

1. The space chat window will automatically launch, which enables you to begin talking with other members

   <img width="600px"  src="https://user-images.githubusercontent.com/116461/62503246-35696880-b7a8-11e9-8292-5b90046bd622.png">

1. When you want to collaborate with someone, simply invite them into a Live Share session by clicking the `Invite` action next to their name in the `Members` list. This will start a read-only Live Share session and present an invtation toast in-tool to the other developer.

   <img width="200px" src="https://user-images.githubusercontent.com/116461/62503417-f2f45b80-b7a8-11e9-8c4c-994e03db1b97.png" />

1. Once you're in the Live Share session, you'll be presented with a chat window for this session (as opposed to space-wide), and you can begin chatting, co-editing, debuging, etc. with the other developer.

   <img width="600px" src="https://user-images.githubusercontent.com/116461/62503986-76af4780-b7ab-11e9-88a2-c3f677e610c5.png">

## Communication

If you'd like to start up an audio call, click the `Start audio call...` node in the Live Share `Session Details` tree in order to start a voice chat with everyone else in the session.

   <img width="200px" src="https://user-images.githubusercontent.com/116461/62504105-eae9eb00-b7ab-11e9-92e8-9fc279b33dbf.png">

Additionally, you can leave code annotations on anyb line of code, by simply hovering over the "comment bar" and adding your comment. These are syncronized with everyone in the session in real-time, and represent a great way to add focus to a discussion and/or leave todo commments for the host to address asyncronously.

   <img width="400px" src="https://user-images.githubusercontent.com/116461/62504298-ba568100-b7ac-11e9-9919-020c9e921331.png">

## Seeking Assistance

When you're ready to ask for assistance (e.g. figuring out a bug, reviewing some code), simply click the `+` button next to the `Help Requests` or `Code Reviews` node in the `Spaces` tree, and specify a description. This will notify th entire space about your request and allow others to jump in to help you.

   <img width="600px" src="https://user-images.githubusercontent.com/116461/62503666-0b18aa80-b7aa-11e9-8037-3dc5ed6aa751.png">

## Providing Assistance

If you'd like to help others within the space, simply look at any outstanding `Help Requests` or `Code Reviews` and click on the join button next to the one you'd like to jump into.

   <img width="200px" src="https://user-images.githubusercontent.com/116461/62503850-ebce4d00-b7aa-11e9-9f20-9d9d1c89815d.png">

When someone creates a help request/broadcast/code review, you'll immediately see a notification about it, which helps to improve visibility when your'e closely working with others. From the toast, you can immediately join their session and/or mute that space.

   <img width="350px" src="https://user-images.githubusercontent.com/116461/63452039-3500dc80-c3fa-11e9-8366-c193c5a8281e.png" />

At any time, you can also mute a space (or all spaces) directly from the `Spaces` tree, which enables you to reduce noise when you're not actively participating in a space.

   <img width="250px" src="https://user-images.githubusercontent.com/116461/63452124-65487b00-c3fa-11e9-8e3f-bc824cfe4bc3.png" />

## Private Spaces

By default, any space you join is public. However, if you're the founder of the space (i.e. the first person to join it), you can choose to make it private by simply right-clicking it and selecting `Make Private`.

   <img width="200px" src="https://user-images.githubusercontent.com/116461/64066583-f547ab00-cbd8-11e9-8f61-357f54ab8d42.png" />

> Note: You can easily identify private spaces within the `Spaces` tree, because they display a lock icon next to their names.

In order to invite members to a private space, right-click the space, select `Copy Link to Space` and send/publish the invitation URL to the intended members. They can simply click that URL, which will deep-link them into VS Code, and automatically join the space.

   <img width="250px" src="https://user-images.githubusercontent.com/116461/64066592-15776a00-cbd9-11e9-8a95-1eb531eafefd.png" />

> Note: As opposed to directly clicking the link, users can also paste the invitation link into the `Join space` input box as well.

Only users that have an invitation link can join the space. If anyone tries to join, and doesn't have the invitation link, they'll be denied access to the space.

   <img width="400px" src="https://user-images.githubusercontent.com/116461/64066612-3b047380-cbd9-11e9-8bcd-c223fcfe3651.png" />

If at any time, you decide that you'd like to make the space public, simply right-click the space and select `Make Public`. Then, anyone can join the space, regardless if they've been invited or not.

   <img width="250px" src="https://user-images.githubusercontent.com/116461/64066605-2d4eee00-cbd9-11e9-9225-cb4e2777f5fb.png" />

## Deep Linking Your Space

To simplify the onboarding process for your space, you can provide a deep link to it, using one (or both) of the following techniques:

1. Right-click your space in the `Spaces` tree, and select `Copy Link to Spaces`. This will generate a URL that you can send to someone (e.g. via e-mail, Slack), and when clicked, it will automatically join them to the space. Additionally, you can publish this URL, along with the Live Share Spaces badge, on a webpage, or GitHub repository (like this one!), so that visitors can easily discover your space.

   <img width="200px" src="https://user-images.githubusercontent.com/116461/63655942-2c364080-c743-11e9-9a5e-554bb5e631d7.png" />

2. If you've built a VS Code extension (or extension pack), that represents your space (e.g. an opinionated set of extensions/tools for a classroom), then you can add an extension dependency to this extension (`vsls-contrib.spaces`), as well as a `liveshare.spaces` contribution point to your extenison's `package.json` file. When others install your extension, it will install Live Share + Spaces, and then automatically join them to the specified spaces.

   ```json
   "contributes": {
      "liveshare.spaces": ["<name>"]
   }
   ```

   _Note: You can see an example of this in the [Live Share Counter](https://github.com/vsls-contrib/counter/blob/master/package.json#L46) sample_.

## FAQ

**How do I create a space?**

By joining it! Live Share Spaces (like Twitter hash tags) are simply monikers that allow multiple developers to discover and collaborate with each other. As a result, there's no need for creation/deletion/management of spaces. You simply join and leave spaces as needed. That said, if you are the first person to join a spaces, you'll get the special title of `Founder` added to your name in the member list 🎉

   <img width="200px" src="https://user-images.githubusercontent.com/116461/62597328-8a85a700-b89a-11e9-85df-b9d9dc3e0258.png" />

## Credits

Icons made by <a href="https://www.flaticon.com/authors/prettycons" title="prettycons">prettycons</a> from <a href="https://www.flaticon.com/"                 title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/"                 title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a>
