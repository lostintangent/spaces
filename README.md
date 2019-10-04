# Live Share Spaces

[![Join space](https://vslscommunitieswebapp.azurewebsites.net/badge/vsls)](http://vslscommunitieswebapp.azurewebsites.net/join_redirect/vsls) [![Join space](https://vslscommunitieswebapp.azurewebsites.net/badge/vsls?insiders)](http://vslscommunitieswebapp.azurewebsites.net/join_redirect/vsls?insiders)

Live Share Spaces enables you to join one or more "spaces", and begin discovering, communicating and collaborating with other developers in real-time. A "space" is nothing more than a name, that allows you to find other people that share common interests and/or context (almost like a Twitter hash tag). A space can represent a team, ad-hoc group (e.g. a hack-a-thon team, a classroom), a language/framework ecosystem (e.g. `elixir`, `redux`), an online forum (e.g. `dev.to/javascript`) and everything in-between. Since spaces can represent literally anything, they can be as broad or as focused as necessary, as long as they help facilitate meaningful collaboration.

Once you join a space, you can chat with other members, invite them into collaboration sessions, ask for help and even live stream anything cool that you're working on. All of this is built-in top of [Live Share](https://aka.ms/vsls), which provides a full-fidelity developer collaboration platform (e.g. co-editing, debugging, localhost server, etc.).

## Getting Started

To begin joining spaces, simply perform the following steps:

1. Install <a href="https://aka.ms/vsls-spaces" target="_blank">this extension</a>, then reload VS Code

1. Open the Live Share activity bar, and look for the `Spaces` tree view. Click the `Sign in with Live Share...` link and complete the sign in flow, using a GitHub or Microsoft Account.

   > If you're already using Live Share then you won't need to sign in again. Signing in is required so that other space members can identify who you are.

1. Click the `Join a space...` link and then type the space name you'd like to join (e.g. `redux`, `python`) or select a popular one from the list

   <img width="400px" src="https://user-images.githubusercontent.com/116461/64935372-c00ca100-d805-11e9-8393-ee6c87e2fce4.png">

   > Alternatively, if you see a GitHub repo or web page with a `Live Share Space` badge (like you see at the top of this readme), you can simply click that in order to join it's respective space.

1. The space chat window will automatically launch, which enables you to begin talking with other members

   <img width="600px" src="https://user-images.githubusercontent.com/116461/64935390-e3cfe700-d805-11e9-9ce9-8f4d381a16d0.png" />

1. To onboard to the new space (e.g. learn any guidelines, get help tips or links to resources), open the space's "readme" by right-clicking the space and selecting `Open Readme` or clicking the "book icon" next to the space's name in the `Spaces` tree

   <img width="600px" src="https://user-images.githubusercontent.com/116461/64935834-25619180-d808-11e9-9293-245fb248d0b5.png" />

1. When you want to collaborate with someone, simply invite them into a Live Share session by clicking the `Invite` action next to their name in the `Members` list. This will start a read-only Live Share session and present an invitation toast in-tool to the other developer.

   <img width="250px" src="https://user-images.githubusercontent.com/116461/64935463-3b6e5280-d806-11e9-890a-620aa1d73ea8.png" />

   > Note: If you're the [founder](#founders) of the space, you can also invite the entire space into a Live Share session, but right-clicking the `Members` node and selecting `Invite All Members`.

## Seeking Assistance

When you're ready to ask for assistance (e.g. figuring out a bug, reviewing some code), simply click the `+` button next to the `Help Requests` or `Code Reviews` node in the `Spaces` tree, and specify a description. This will notify the entire space about your request and allow others to jump in to help you.

   <img width="500px" src="https://user-images.githubusercontent.com/116461/64935502-88eabf80-d806-11e9-9bfa-247466ccbf8a.png">

## Providing Assistance

If you'd like to help others within the space, simply look at any outstanding `Help Requests` or `Code Reviews` and click on the join button next to the one you'd like to jump into.

   <img width="250px" src="https://user-images.githubusercontent.com/116461/64935577-e7b03900-d806-11e9-93bd-71ecc36da5b3.png">

When someone creates a help request/broadcast/code review, you'll immediately see a notification about it, which helps to improve visibility when your'e closely working with others. From the toast, you can immediately join their session and/or mute that space.

   <img width="450px" src="https://user-images.githubusercontent.com/116461/64935523-a15ada00-d806-11e9-944f-c1c99707fb1a.png" />

At any time, you can also mute a space (or all spaces) directly from the `Spaces` tree, which enables you to reduce noise when you're not actively participating in a space.

   <img width="250px" src="https://user-images.githubusercontent.com/116461/64935647-44135880-d807-11e9-8361-a8e49b889d1c.png" />

## Communication

If you'd like to start up an audio call, click the `Start audio call...` node in the Live Share `Session Details` tree in order to start a voice chat with everyone else in the session.

   <img width="250px" src="https://user-images.githubusercontent.com/116461/62504105-eae9eb00-b7ab-11e9-92e8-9fc279b33dbf.png">

Additionally, you can leave code annotations on any line of code, by simply hovering over the "comment bar" and adding your comment. These are synchronized with everyone in the session in real-time, and represent a great way to add focus to a discussion and/or leave to-do comments for the host to address asynchronously.

   <img width="450px" src="https://user-images.githubusercontent.com/116461/62504298-ba568100-b7ac-11e9-9919-020c9e921331.png">

## Private Spaces

By default, any space you join is public. However, if you're the founder of the space (i.e. the first person to join it), you can choose to make it private by simply right-clicking it and selecting `Make Private`.

   <img width="250px" src="https://user-images.githubusercontent.com/116461/64935662-54c3ce80-d807-11e9-9063-dd165d818b01.png" />

> Note: You can easily identify private spaces within the `Spaces` tree, because they display a lock icon next to their names.

In order to invite members to a private space, right-click the space, select `Copy Link to Space` and send/publish the invitation URL to the intended members. They can simply click that URL, which will deep-link them into VS Code, and automatically join the space.

   <img width="250px" src="https://user-images.githubusercontent.com/116461/64935685-6907cb80-d807-11e9-9522-93f05c274c9d.png" />

> Note: As opposed to directly clicking the link, users can also paste the invitation link into the `Join space` input box as well.

Only users that have an invitation link can join the space. If anyone tries to join, and doesn't have the invitation link, they'll be denied access to the space.

   <img width="450px" src="https://user-images.githubusercontent.com/116461/64935699-7ae96e80-d807-11e9-9e59-e9c96d18c8fd.png" />

If at any time, you decide that you'd like to make the space public, simply right-click the space and select `Make Public`. Then, anyone can join the space, regardless if they've been invited or not.

   <img width="250px" src="https://user-images.githubusercontent.com/116461/64935710-88065d80-d807-11e9-8213-0c9e5f75559b.png" />

## Deep Linking Your Space

To simplify the onboarding process for your space, you can provide a deep link to it, using one (or both) of the following techniques:

1. Right-click your space in the `Spaces` tree, and select `Copy Link to Spaces`. This will generate a URL that you can send to someone (e.g. via e-mail, Slack), and when clicked, it will automatically join them to the space. Additionally, you can publish this URL, along with the Live Share Spaces badge, on a webpage, or GitHub repository (like this one!), so that visitors can easily discover your space.

   <img width="250px" src="https://user-images.githubusercontent.com/116461/64935685-6907cb80-d807-11e9-9522-93f05c274c9d.png" />

1. If you've built a VS Code extension (or extension pack), that represents your space (e.g. an opinionated set of extensions/tools for a classroom), then you can add an extension dependency to this extension (`vsls-contrib.spaces`), as well as a `liveshare.spaces` contribution point to your extension's `package.json` file. When others install your extension, it will install Live Share + Spaces, and then automatically join them to the specified spaces.

   ```json
   "contributes": {
      "liveshare.spaces": ["<name>"]
   }
   ```

   _Note: You can see an example of this in the [Live Share Counter](https://github.com/vsls-contrib/counter/blob/master/package.json#L46) sample_.

1. Adding a `.space` file to your project repo, which simply includes the name of the space you'd like anyone that opens it to join.

## Founders

The first person that joins a space becomes its founder. A founder is simply a member of the space, who can perform the following special capabilities:

1. Clearing the history of the space's chat channel
1. Toggling the public/private status of the space
1. Editing the space's readme
1. Blocking/unblocking other members from the space
1. Inviting the entire space into a Live Share session (e.g. as opposed to individual members)

Since a space might have multiple people that need to administer it, a founder can give other members "founder" status, which automatically gives them the aforementioned privileges. To do this, you can simply right-click a member and select the `Promote to Founder` action.

<img width="300px" src="https://user-images.githubusercontent.com/116461/65293220-547d4900-db0f-11e9-88ed-d1b14e4fd00c.png" />

If at any time, you want to demote a member, you can simply right-click them and select the `Demote to Member` action.

## Moderating Your Space

If someone is disrupting a space, or was unintentionally invited, a founder can block them from the space by simply right-clicking their name in the `Spaces` tree and selecting `Block Member`. This will immediately remove the user from the space, and prevent them from being able to join again in the future.

<img width="300px" src="https://user-images.githubusercontent.com/116461/65303404-d337ad80-db32-11e9-84a9-c8ae2ecd0c1c.png" />

If you accidentally block someone, or you'd like to allow someone back into the space, a founder can right-click the `Members` node within a space, and select `Unblock Member`.
