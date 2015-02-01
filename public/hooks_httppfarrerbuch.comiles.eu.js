/*
RDForm Hooks-File - to hook in on certain points of application execution

Variables:
_this.rdform 	- The RDForm-class. Plublic functions can accessed like: _this.rdform.showAlert( "info", "...");
_this.$elem 	- The form element
*/
RDForm_OntoWiki_Hooks.prototype = {

	// after model is parsed - init form handlers
	__initFormHandlers : function () {
		var _this = this;
		
		// get hidden birthYear and deathYear for the label
		_this.$elem.on("keyup", 'input[name="http://purl.org/voc/hp/birthDate"]', function() {
			var bYear = $(this).val().slice(0, 4);
			_this.$elem.find('input[name="birthDate"]').val( bYear ).trigger("keyup");
		});
		_this.$elem.on("keyup", 'input[name="http://purl.org/voc/hp/dateOfDeath"]', function() {
			var dYear = $(this).val().slice(0, 4);
			_this.$elem.find('input[name="deathDate"]').val( dYear ).trigger("keyup");
		});
	},

	// after instert existing data into the form
	__afterInsertData : function() {
		var _this = this;

		// autocorrect wrong gYear dates (XXXX-01-01T00:00:00Z)
		_this.$elem.find( 'input[datatype="xsd:date"]' ).each(function() {
			if ( $(this).val().search(/.*-01-01T00:00:00.*/) != -1 ) {
				$(this).val( $(this).val().substring(0,4) );
			} else if ( $(this).val().search(/.*-01T00:00:00.*/) != -1 ) {
				$(this).val( $(this).val().substring(0,7) );
			}
		});
	},

	// after adding a property
	__afterAddProperty : function ( thisPropertyContainer) {
		var _this = this;
		var thisProperty = thisPropertyContainer.find("."+_this.rdform._ID_+"-property").first();
	},

	// after adding a property
	__afterDuplicateProperty : function ( thisPropertyContainer ) {
		var _this = this;
		var thisProperty = thisPropertyContainer.find("."+_this.rdform._ID_+"-property").first();
	},

	// after adding a property
	__beforeRemoveProperty : function ( thisPropertyContainer ) {
		var _this = this;
		var thisProperty = thisPropertyContainer.find("."+_this.rdform._ID_+"-property").first();
	},

	// after leave an external resource input field
	__afterBlurExternalResource : function( thisResource ) {
		var _this = this;
	},

	// on click edit-subform btn
	__editSubform: function( resContainer ) {
		var _this = this;
		var resource = $(resContainer).find("input."+_this.rdform._ID_+"-property");
	},

	// on click new-subofrm btn
	__newSubform : function( resContainer ) {
		var _this = this;
	},

	// validate form-input on change value or on submit the form
	__userInputValidation : function ( property ) {
		var _this = this;
	},

	// get the the item for the result-search list on autocomplete
	__autocompleteGetItem : function( item ) {
		// e.g. change the label as: item.label.value = "My val: " + item.label.value;
		var _this = this;

		if ( item.hasOwnProperty("posLabel") ) {
			item.label.value = item.label.value + ", " + item.posLabel.value;
		}
		else if ( item.hasOwnProperty("schoolType") ) {
			if ( item.hasOwnProperty("schoolLabel") ) {
				item.label.value = item.label.value + ", " + item.schoolLabel.value + " " + item.schoolType.value;
			} else {
				item.label.value = item.label.value + ", " + item.schoolType.value;
			}
			
		}
		else if ( item.hasOwnProperty("lastName") ) {
			item.label.value = item.lastName.value + ", " + item.label.value;
		}
		else if ( item.hasOwnProperty("district") ) {
			item.label.value = item.label.value + " (" + item.district.value + ")";
		}

		return item;
	},

	__restoreResource: function( resource, result ) {
		var _this = this;
		var resultUri = result["@id"];
		var resourceLabel = "";
		var resContainer = $(resource).parentsUntil(".form-group").parent();

		// add location to hasPositions link label
		if ( result["@type"][0] == "http://purl.org/voc/hp/Position" ) {
			resourceLabel = result['http://www.w3.org/2000/01/rdf-schema#label'][0]['@value'];
			_this.hooks.getResourceData( result["http://purl.org/voc/hp/place"][0]["@id"], function( dataNew ){
				resourceLabel = dataNew[0]['http://www.w3.org/2000/01/rdf-schema#label'][0]['@value'] + " " + resourceLabel;
				$(resContainer).find('p.'+_this.rdform._ID_+'-resource-uri-container').remove();

				$(resource).after('<p class="'+_this.rdform._ID_+'-resource-uri-container"><a href="'+resultUri+'" class="'+_this.rdform._ID_+'-resource-uri">'+resourceLabel+'</a></p>');
			});
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
	},

}

function RDForm_OntoWiki_Hooks( rdform, hooks ) {
	var _this = this;
	_this.rdform = rdform;
	_this.$elem = rdform.$elem;
	_this.hooks = hooks;
}