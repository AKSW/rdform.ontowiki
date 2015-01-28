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

		// get arguments for a subform and set in resource class
		var parentSubform = _this.$elem.parent(".rdform-subform");
		if ( $(parentSubform).length > 0 ) {
			if ( $(parentSubform).attr("arguments") !== undefined ) {
				var args = $(parentSubform).attr("arguments");
				_this.$elem.find("div[typeof]").attr("arguments", args);
				_this.$elem.find("div[typeof]").data("rdform-model")["@rdform"]["arguments"] = $.parseJSON(args);
			}
			return false; // return, we dont want to dubble reinit all event handlers!
		}

		return true;
	},

	// on insert a existing resource into the form
	// get and return i and di for asynchronus call
	// i=relation, di=index, resource=resourceUri
	__insertResource : function( i, di, resource, callback ) {
		var _this = this;

		if ( ! resource.hasOwnProperty("@type") ) { // it seems to be an external resource, get data from ontowiki
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

	},

	// after instert existing data into the form
	__afterInsertData : function() {
		var _this = this;
	},	

	// after adding a property
	__afterAddProperty : function ( thisPropertyContainer ) {
		var _this = this;
	},	

	// on click edit-subform btn
	__editSubform: function( resContainer ) {
		var _this = this;
		var resource = $(resContainer).find("input."+_this.rdform._ID_+"-property");
		_this.getResourceData( $(resource).val(), function( data ){
			_this.createSubform( $(resContainer), data[0]);
		});
	},

	// on click new-subofrm btn
	__newSubform : function( resContainer ) {
		var _this = this;
		_this.createSubform( $(resContainer), null);
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
	createSubform: function( resContainer, data ) {
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
					if ( data != null ) {
						hash = data["@hash"];
					}

					owCon.updateResource( modelIri, result["@id"], hash, result, function( updateResult ) {
						if ( updateResult == true ) {
							$(resource).val( result["@id"] ).hide().trigger("blur");
							$(resContainer).find('p.'+_this.rdform._ID_+'-resource-uri-container').remove();
							var resourceLabel = result["@id"].split("/").reverse()[0];
							if ( result.hasOwnProperty('http://www.w3.org/2000/01/rdf-schema#label') ) {
								resourceLabel = result['http://www.w3.org/2000/01/rdf-schema#label'][0]['@value'];
							}
							$(resource).after('<p class="'+_this.rdform._ID_+'-resource-uri-container"><a href="'+result["@id"]+'" class="'+_this.rdform._ID_+'-resource-uri">'+resourceLabel+'</a></p>');
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
		});
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
	this.rdform = rdform;
	this.$elem = rdform.$elem;

	this.isGetResourceBusy = false;

	return this;
}