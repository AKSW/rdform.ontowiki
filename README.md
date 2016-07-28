# RDForm

Extension to integrate [RDForm](https://github.com/simeonackermann/RDForm/) into OntoWiki with [SiteExtension](https://github.com/AKSW/site.ontowiki/).


## Installation ##

- install Ontowiki with [SiteExtension](https://github.com/AKSW/site.ontowiki/)
- clone this repo to extensions/rdform
- run `git submodule init && git submodule update`

- import an Ontology to set class template. Each resource needs an `rdf:type` and each `rdf:type` needs to describe with `<http://ns.ontowiki.net/SysOnt/Site/classTemplate>`. Please adopt [example_ontology.ttl](https://raw.githubusercontent.com/AKSW/rdform.ontowiki/master/public/example_ontology.ttl) to your requirements.

- create your form templates and put them to `extension/rdform/public/`. They have to named like: `form_[base-uri-without-special-chars].[classTemplte].html`. e.g. if your base model is `http://example.com/` and the class template `person`, the name should be: `form_httpexample.com.person.html`

- enable rdform in `layout.phtml` from site extension (see [sample-layout](https://raw.githubusercontent.com/AKSW/rdform.ontowiki/master/site-example_layout.phtml)):

```
<?php
$rdform = $owApp->extensionManager->getComponentHelper('rdform');
$rdform->siteInit();
...
// in html header:
echo $rdform->getStyles();
...
// at the end of body (after jquery include):
echo $rdform->getScripts();
```


## Configure ##

- some configuration is possible in extensions/site.ini:

```
enabled = true

[private]
defaultLang = "en"
debug = false
useHooks = false
```

- language files put to `extensions/rdform/public/lang.js`

TODO: hooks

## RDForm Documentation ##

Look at [main documentation](https://github.com/simeonackermann/RDForm/)

New for OntoWiki:

- Subforms

- Wildcard Functions
	HASH
	BASE

- New Attributes
	subform
	typeof (for external resources)
	editaftercomplete
	ondeletecascade
	

- More then one labels in autocomplete