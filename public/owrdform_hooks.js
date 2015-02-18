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
		}

	},

	__writeWildcardValue : function( elem, wldVal ) {
		var _this = this;

		if ( _this.owHooks && typeof _this.owHooks.__writeWildcardValue !== "undefined" )
			wldVal = _this.owHooks.__writeWildcardValue( elem, wldVal );

		return wldVal;
	},

	__afterInitFormHandler : function() {
		var _this = this;
		/*
		TODO
		_this.$elem.find("input[promptlysubform]").each( function() {
			if ( $(this).val() == "" ) {
				$(this).parent().find(".rdform-new-subform").trigger("click");
			}
		});
		*/
	},

	__beforeInsertData : function() {
		var _this = this;
		//add loading msg on insert data
		var $alertContainer = _this.$elem.parent().find(".rdform-alert");
		$alertContainer.append( $('<div class="alert alert-info loading rdform-loading-msg">Eigenschaften werden geladen. Bitte warten - </div>').hide() );
	},

	// on insert a existing resource into the form
	// get and return i and di for asynchronus call
	// i=relation, di=index, resource=resourceUri
	__insertResource : function( i, di, resource, callback ) {
		var _this = this;

		if ( ! resource.hasOwnProperty("@type") ) { // it seems to be an external resource, get data from ontowiki

			// get resource only if there is an input or button with subform attribute
			var resourceInput = _this.rdform.getElement( _this.$elem.find("input,button"), 'name', i ).first();
			if ( resourceInput.length > 0 &&  $(resourceInput).attr("typeof") !== undefined ) {
				_this.getResourceData( resource["@id"], function( data ){
					if ( data.length == 0 ) { // no data found!
						callback(i, di, resource);
					} else {
						if ( _this.owHooks && typeof _this.owHooks.__insertResourceData !== "undefined" )
							data[0] = _this.owHooks.__insertResourceData( i, data[0] );
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

		if ( $(thisProperty).attr("onDeleteCascade") !== undefined ) {
			//console.log("TODO: delete cascade if its the only resource-relatiob.instance...");
		}
	},

	// after leave an external resource input field
	__afterBlurExternalResource : function( thisResource ) {
		var _this = this;
		// get resource data and insert link
		if ( $(thisResource).val().search(/^http/) != -1 ) {
			_this.getResourceData( $(thisResource).val(), function( dataNew ){
				if ( dataNew.length != 0 ) {
					_this.restoreResource( thisResource, dataNew[0] );
				} else {
					_this.restoreResource( thisResource, $(thisResource).val() );
				}
			});
		}
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
		
		if ( _this.owHooks && typeof _this.owHooks.__userInputValidation !== "undefined" )
			return _this.owHooks.__userInputValidation( property );		

		return true;
	},

	// on select autoconplete item
	__selectAutocompleteItem : function( elem, resourceUri ) {
		var _this = this;
		if ( $(elem).attr("editaftercomplete") !== undefined ) {
			$(elem).val( resourceUri );
			$(elem).parent().find("button.rdform-edit-subform").trigger("click");
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

		// reaplce spaces with _, the webSafeString function would replace it with -
		$(thisClass).attr( "resource", $(thisClass).attr( "resource").replace( " ", "-") );
	},

	__createdClass : function ( thisClass ) {
		var _this = this;
		
		// OntoWiki Bugfix: max 250 resource uri. Otherwise saving will cause an error
		thisClass["@value"]["@id"] = _this.rdform.replaceStrPrefix( thisClass["@value"]["@id"] ).substring(0,250);
		return thisClass
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
				lang: _this.rdform.settings.lang.split("/").reverse()[0],
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
				$(resContainer).find("."+_this.rdform._ID_+"-edit-subform").removeClass("hide");
				$(subformContainer).remove();
			});
			$(resContainer).children().hide();
			$(subformContainer).show("slow");
			$(subformContainer).find("."+_this.rdform._ID_+"-submit-btn-group").hide();
			$(subformContainer).focusin(function() {
				$(subformContainer).find("."+_this.rdform._ID_+"-submit-btn-group").show();
			});
		});
	},

	// rewrite value and link of external resource from result
	restoreResource : function( resource, result ) {
		var _this = this;
		if ( typeof result === "string" ) {
			var result = { "@id" : result };
		}
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

		var $loadingMsg = _this.$elem.parent().find(".rdform-loading-msg");
		$loadingMsg.show();

		owCon.getResource( modelIri, resourceUri, function( owConData ) {
			jsonld.fromRDF( owConData.data,  {format: 'application/nquads'}, function(err, doc) {
					$loadingMsg.hide();
					if ( doc.length > 0 ) {
						doc[0]["@hash"] = owConData.dataHash;
					}
					if (err) { console.log('There was an error', err); }
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