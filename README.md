# Revel Digital Webapp GitHub Action

Deploy your web application to the Revel Digital CMS with ease.

## Usage

This GitHub Action facilitates the deployment of a web app to the Revel Digital CMS.

### Example Workflow

```yaml
name: Deploy Webapp
on: push

jobs:
  release-webapp:
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [ubuntu-latest]

    steps:
      - name: Check out Git repository
        uses: actions/checkout@v1

      - name: Install Node.js, NPM and Yarn
        uses: actions/setup-node@v1
        with:
          node-version: 22

      - name: install angular
        run: npm install -g @angular/cli@17

      - name: npm dependencies
        run: npm install

      - name: Build webapp
        run: ng build

      - name: Deploy webapp to Revel CMS
        uses: RevelDigital/webapp-action@v1.0.11
        with:
          api-key: ${{ secrets.Revel_API_Key }}
          environment: ${{ github.head_ref || github.ref_name }}
```

## Inputs

- `name`: **Optional** - Name for the webapp. If not supplied will automatically be pulled from the name field in package.json if available.
- `group-name`: **Optional** - Group name as a regex pattern.
- `version`: **Optional** - Version of the webapp. Defaults to version from `package.json` if available.
- `api-key`: **Required** - Revel Digital API key. It's suggested to use Github secrets to store the API key. [See doc here](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions)
- `tags`: **Optional** - Extra tags for smart scheduling.
- `distribution-location`: **Optional** - Distribution folder with assets to wrap into a webapp. If not supplied will automatically be pulled from the package.json if available.
- `environment`: **Optional** - Deployment environment. Default is `Production`. Options: `Production`, `Development`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
