# Juku Salary App 💰

塾講師のための給与計算Webアプリです。

## 技術スタック
- Vite + React + TypeScript
- GitHub Pages (自動デプロイ)

## デプロイ方法 (GitHub Pages)

このアプリは、GitHubにプッシュするだけで自動的に公開されるように設定されています。

### 初回設定 (重要)

1. **GitHubにリポジトリを作成**
   ご自身のGitHubアカウントで、新しいリポジトリ（Public）を作成してください。

2. **コードをプッシュ**
   このフォルダの内容をリポジトリにプッシュします。

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git
   git push -u origin main
   ```

3. **GitHub Pagesを有効化** (プッシュ後)
   1. GitHubのリポジトリページを開きます。
   2. 「**Settings**」タブをクリックします。
   3. 左メニューの「**Pages**」をクリックします。
   4. **Build and deployment** の **Source** が「**Deploy from a branch**」になっていることを確認します。
   5. **Branch** の設定で、「**gh-pages**」ブランチを選択し、フォルダは「/(root)」のまま「**Save**」を押します。
      > ※ `gh-pages` ブランチは、最初のプッシュが行われ、GitHub Actionsが完了した後（数分後）に自動的に作成されます。まだ選択肢にない場合は、Actionsタブでビルドが終わるのを待ってください。

4. **URLの確認**
   設定が完了すると、ページ上部に公開URLが表示されます。
   例: `https://あなたのユーザー名.github.io/リポジトリ名/`

   このURLをスマホで開いて、ホーム画面に追加すればアプリのように使えます！
