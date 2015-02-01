/*
RDForm Hooks-File - to hook in on certain points of application execution

Variables:
_this.rdform 	- The RDForm-class. Plublic functions can accessed like: _this.rdform.showAlert( "info", "...");
_this.$elem 	- The form element
*/
RDForm_Hooks.prototype = {

	// after model is parsed - init form handlers
	__initFormHandlers : function () {
		var _this = this;

		if ( _this.owHooks && typeof _this.owHooks.__initFormHandlers !== "undefined" )
			_this.owHooks.__initFormHandlers();

		// get arguments for a subform and set in resource class
		var parentSubform = _this.$elem.parent(".rdform-subform");
		if ( $(parentSubform).length > 0 ) {
			if ( $(parentSubform).attr("arguments") !== undefined ) {
				var args = $(parentSubform).attr("arguments");
				_this.$elem.find("div[typeof]").attr("arguments", args);
				_this.$elem.find("div[typeof]").data("rdform-model")["@rdform"]["arguments"] = $.parseJSON(args);
			}
			//return false; // return, we dont want to dubble reinit all event handlers!
		}

		//return true;
	},

	// on insert a existing resource into the form
	// get and return i and di for asynchronus call
	// i=relation, di=index, resource=resourceUri
	__insertResource : function( i, di, resource, callback ) {
		var _this = this;

		if ( ! resource.hasOwnProperty("@type") ) { // it seems to be an external resource, get data from ontowiki

			// get resource only if there is an input with subofrm attribute
			var resourceInput = _this.rdform.getElement( _this.$elem.find("input"), 'name', i ).first();
			if ( resourceInput.length > 0 &&  $(resourceInput).attr("typeof") !== undefined ) {
				_this.getResourceData( resource["@id"], function( data ){
					if ( data.length == 0 ) { // no data found!
						callback(i, di, resource);
					} else {
						callback( i, di, data[0] );	
					}
				});
			} else {
				callback(i, di, resource);	
			}
		} else {
			callback(i, di, resource);
		}
	},

	// after instert existing data into the form
	__afterInsertData : function() {
		var _this = this;

		if ( _this.owHooks && typeof _this.owHooks.__afterInsertData !== "undefined" )
			_this.owHooks.__afterInsertData( );

		_this.$elem.find("input[external]:not([hidden])").each( function() {
			$(this).trigger("blur");
		} );
	},	

	// after adding a property
	__afterAddProperty : function ( thisPropertyContainer ) {
		var _this = this;
	},	

	// after adding a property
	__afterDuplicateProperty : function ( thisPropertyContainer ) {
		var _this = this;
		var thisProperty = thisPropertyContainer.find("."+_this.rdform._ID_+"-property").first();

		// set forename placeholder to index
		if ( $(thisProperty).attr("typeof") !== undefined &&  $(thisProperty).attr("typeof").search(/cpm:Forename/) != -1 ) {
			var arguments = $(thisProperty).attr("arguments");
			var index = $.parseJSON( arguments )['i'];
			$(thisProperty).find('input[name="cpm:forename"]').attr( "placeholder" , index + ". Vorname");
		}
	},

	// after adding a property
	__beforeRemoveProperty : function ( thisPropertyContainer ) {
		var _this = this;
		var thisProperty = thisPropertyContainer.find("."+_this.rdform._ID_+"-property").first();
	},

	// after leave an external resource input field
	__afterBlurExternalResource : function( thisResource ) {
		var _this = this;
		// get resource data and insert link
		_this.getResourceData( $(thisResource).val(), function( dataNew ){
			if ( dataNew.length != 0 ) { 
				_this.restoreResource( thisResource, dataNew[0] );
			}
		});
	},

	// on click edit-subform btn
	__editSubform: function( resContainer ) {
		var _this = this;
		var resource = $(resContainer).find("input."+_this.rdform._ID_+"-property");		
		
		if ( _this.owHooks && typeof _this.owHooks.__editSubform !== "undefined" )
			_this.owHooks.__editSubform( resContainer );

		// may get resousrce data from subform query
		if ( $(resource).attr("subform-query") !== undefined ) {
			var subformQuery = $(resource).attr("subform-query");

			// tmp replace brackets for wildcard searching, replace THIS with this element value, reaplace wildcards
			subformQuery = subformQuery.replace(/{ /g, '$BRACKET$ ').replace(/ }/g, ' $BRACKET$');
			subformQuery = subformQuery.replace(/{THIS}/g, $(resource).val() );
			subformQuery = _this.rdform.replaceWildcards( subformQuery, _this.$elem );
			subformQuery = subformQuery["str"];
			subformQuery = subformQuery.replace(/\$BRACKET\$ /g, '{ ').replace(/ \$BRACKET\$/g, ' }');
			
			$.ajax({
				url: urlBase + "/sparql",
				dataType: "json",
				data: {
					query: subformQuery,
					format: "json"
				},
				success: function( data ) {
					_this.getResourceData( data.results.bindings[0].event["value"], function( newData ){
						_this.createSubform( $(resContainer), newData[0]);
					});
				},
				error: function(e) {
					console.log( 'Error on autocomplete: ', e );
				},
			});
		} else {
			_this.getResourceData( $(resource).val(), function( data ){
				_this.createSubform( $(resContainer), data[0]);
			});
		}		
	},

	// on click new-subofrm btn
	__newSubform : function( resContainer ) {
		var _this = this;
		_this.createSubform( $(resContainer), null );
	},

	// validate form-input on change value or on submit the form
	__userInputValidation : function ( property ) {
		var _this = this;
		
		// validate if cpm:from is a smaller date than cpm:to
		if ( $(property).attr("name") == "cpm:from" ) {
			var from = Date.parse( $(property).val() );
			var toEl = $(property).parentsUntil(".rdform-literal-group").parent().next().find('input[name="cpm:to"]');
			var to = Date.parse( toEl.val() );	
			if ( from >= to ) {
				return false;
			} else {
				if ( $(property).parentsUntil(".rdform-literal-group").parent().next().hasClass("has-error") ) {
					_this.rdform.userInputValidation( toEl );
				}
			}
		}
		else if ( $(property).attr("name") == "cpm:to" ) {
			var to = Date.parse( $(property).val() );
			var fromEl = $(property).parentsUntil(".rdform-literal-group").parent().prev().find('input[name="cpm:from"]');
			var from = Date.parse( fromEl.val() );
			if ( from >= to ) {
				return false;
			} else {
				if ( $(property).parentsUntil(".rdform-literal-group").parent().prev().hasClass("has-error") ) {
					_this.rdform.userInputValidation( fromEl );
				}
			}
		}

	},

	// on get autocomplete item, may add individual label or value
	// return Object: item.label.value, item.item.value
	__autocompleteGetItem : function( item ) {
		var _this = this;

		if ( _this.owHooks && typeof _this.owHooks.__autocompleteGetItem !== "undefined" )
			item = _this.owHooks.__autocompleteGetItem( item );

		return item;
	},

	// before creating the result object from the html form
	__createResult : function() {
		var _this = this;
	},

	// before creating the class properties from input values
	__createResultClassProperty : function( propertyContainer ) {
		var _this = this;
	},

	// before generating the class object from input values and properties
	__createClass : function ( thisClass ) {
		var _this = this;

		$(thisClass).attr( "resource", $(thisClass).attr( "resource").replace( " ", "_") );
	},

	/*
	 Private functions
	*/

	// create a subform
	createSubform: function( resContainer, data, callback ) {
		var _this = this;
		var resource = $(resContainer).find("input."+_this.rdform._ID_+"-property");
		var subformContainer = $('<div class="'+_this.rdform._ID_+'-subform"></div>');

		if ( $(resource).attr("arguments") !== undefined ) {
			$(subformContainer).attr("arguments", $(resource).attr("arguments") );
		}
		$(resContainer).append( $(subformContainer).hide() );

		jsonld.toRDF( data, {format: 'application/nquads'}, function(err, nquads) {
			var owRdform = new OntoWikiRDForm({
				template: "form_" + urlBase.replace(/[^a-z0-9-_.]/gi,'') + "." + $(resource).attr("subform") + ".html",
				$container: subformContainer,
				data: nquads,
				lang: "de.js",
			});
			owRdform.init( function(result){ 

				if ( result ) {
					var modelIri = $("#modelIri").val();
					var hash = '40cd750bba9870f18aada2478b24840a'; // hash for empty resource
					var subForm = $(subformContainer).find("div[typeof]").first();
					if ( data != null ) {
						hash = data["@hash"];
					}

					owCon.updateResource( modelIri, result["@id"], hash, result, function( updateResult ) {
						if ( updateResult == true ) {
							var resultUri = result["@id"];

							if ( $(subForm).attr("id-return") !== undefined ) { // may get return-resource
								resultUri = _this.rdform.replaceWildcards( $(subForm).attr("id-return"), $(subForm) );
								resultUri = resultUri["str"];
							}
							$(resource).val( resultUri );

							if ( resultUri == result["@id"] ) {
								//restoreResource( result );
								_this.restoreResource( resource, result );
							} else { // may get label for the new return-resource 
								_this.getResourceData( resultUri, function( dataNew ){
									if ( dataNew.length == 0 ) { // no dataNew found!
										//restoreResource( result );
										_this.restoreResource( resource, result );
									} else {
										//restoreResource( dataNew[0] );
										_this.restoreResource( resource, dataNew[0] );
									}
								});

							}							
						} else {
							alert(updateResult);
						}
					});
				}
				$(resContainer).children().show();
				$(subformContainer).remove();
			});
			$(resContainer).children().hide();
			$(subformContainer).show("slow");
			
			// TODO: dont duplcaite class on edit subform...			
			//removeParentEventHandler( owRdform );			
		});

		// remove event handler in subform from parent RDForm
		function removeParentEventHandler( subform ) {
			var subform = subform.rdform._rdform_class;
			//var parentHandler = _this.rdform.initFormHandler;
			//subform.$elem.off("click", "button."+_this.rdform._ID_+"-duplicate-property", parentHandler.duplicateProperty );
			console.log("BUG: duplicated Subform!", subform);
			subform.$elem.off("change", "input" );
			subform.$elem.off("click", "button."+_this.rdform._ID_+"-edit-subform" );
			subform.$elem.off("click", "button."+_this.rdform._ID_+"-new-subform" );
			subform.$elem.off("click", "button."+_this.rdform._ID_+"-add-property" );
			subform.$elem.off("click", "button."+_this.rdform._ID_+"-duplicate-property" );
			subform.$elem.off("click", "button."+_this.rdform._ID_+"-remove-property" );
			subform.$elem.off("click", "div."+_this.rdform._ID_+"-edit-class-resource span" );
			subform.$elem.off("keyup", "div."+_this.rdform._ID_+"-edit-class-resource input" );
			subform.$elem.off("change blur", "div."+_this.rdform._ID_+"-edit-class-resource input" );
			subform.$elem.off("blur", "input[external]" );
			subform.$elem.off("focus", "input[autocomplete]" );
			subform.$elem.off("change", "input[autocomplete]" );
		}
	},

	// rewrite value and link of external resource from result
	restoreResource : function( resource, result ) {
		var _this = this;
		var resultUri = result["@id"];
		var resourceLabel = resultUri.split("/").reverse()[0];
		var resContainer = $(resource).parentsUntil(".form-group").parent();
		$(resContainer).find('p.'+_this.rdform._ID_+'-resource-uri-container').remove();
		$(resource).hide();

		if ( _this.owHooks && typeof _this.owHooks.__restoreResource !== "undefined" )
			_this.owHooks.__restoreResource( resource, result );		
		
		if ( result.hasOwnProperty('http://www.w3.org/2000/01/rdf-schema#label') ) {
			resourceLabel = result['http://www.w3.org/2000/01/rdf-schema#label'][0]['@value'];
		}

		$(resource).after('<p class="'+_this.rdform._ID_+'-resource-uri-container"><a href="'+resultUri+'" class="'+_this.rdform._ID_+'-resource-uri">'+resourceLabel+'</a></p>');
	},

	// get resource data. Wait if other 
	getResourceData : function( resourceUri, callback ) {
		var _this = this;

		owCon.getResource( modelIri, resourceUri, function( owConData ) {
			jsonld.fromRDF(
				owConData.data, 
				{format: 'application/nquads'},
				function(err, doc) {
					if ( doc.length > 0 ) {
						doc[0]["@hash"] = owConData.dataHash;
					}
					callback( doc );
				}
			);
		});
	},

} // end of hooks

/*
RDForm_Hooks class. Normally you dont need to edit this
*/
function RDForm_Hooks( rdform ) {
	var _this = this;
	_this.rdform = rdform;
	_this.$elem = rdform.$elem;
	_this.owHooks = null;

	if ( _this.rdform.settings.owHooks ) {
		$.ajax({ url: _this.rdform.settings.owHooks, dataType: "script", async: false,
			success: function() {
				try {
					_this.owHooks = new RDForm_OntoWiki_Hooks( _this.rdform, _this );
				} catch (e) {
					_this.rdform.showAlert( "error", 'Cannot init hooks file "'+ _this.rdform.settings.owHooks +'": '+e );
				}
			},
			error: function( jqxhr, type, e ) {
				_this.rdform.showAlert( "error", 'Cannot load hooks file "'+ _this.rdform.settings.owHooks +'": '+e );
			}
		});
	}

	
	return this;
}