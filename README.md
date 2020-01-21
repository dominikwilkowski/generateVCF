Generate contact vcf files from a tsv database
===========

Just run the script and generate `*.vcs` files from a `tab separated values` (tsv) file.

```sh
cd path/to/this/repo
yarn # install dependencies
node index.js write
```

To setup you have to create a [legacy token](https://api.slack.com/custom-integrations/legacy-tokens) for slack and add it into your `.env` file:

```sh
SLACK=YOURSUPERSECRETTOKEN
```

You can optionally overwrite the path to the tsv file (default `people.tsv`) via:

```sh
node index.js write "your/path/to/the/tsv/file.tsv"
```


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## Release History

* v1.0.0  - Initial release


**[⬆ back to top](#contents)**


----------------------------------------------------------------------------------------------------------------------------------------------------------------


## License

Copyright (c) Dominik Wilkowski. Licensed under [GNU-GPLv3](https://raw.githubusercontent.com/dominikwilkowski/generateVCF/master/LICENSE).


**[⬆ back to top](#contents)**

# };
