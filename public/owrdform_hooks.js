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

		/*
		// really write checked-attrs for checkboxes -> MASTER-BRANCH CANDIDATE
		_this.$elem.on( 'click', 'input[type=checkbox]', function(){
			$(this).attr("checked", $(this).prop("checked"));

		// really write textarea value to html
		_this.$elem.on( 'change', 'textarea', function(){
			$(this).text( $(this).val() );
		});
		*/

		// change isForename checkbox value to 1/0
		_this.$elem.on("change", 'input:checkbox', function() {
			$(this).val( $(this).prop("checked") ? "1" : "0" );
		});

		// on change forename insert all forenames (rufname) into global input
		_this.$elem.on("keyup change", 'div[typeof="cpm:Forename"]', function() {
			var forenames = "";
			
			_this.$elem.find('div[typeof="cpm:Forename"]').each(function() {
				if ( $(this).find('input[name="cpm:isFirstName"]').prop("checked") ) {
					forenames += $(this).find('input[name="cpm:forename"]').val() + " ";
				}
			});

			forenames = forenames.trim();
			_this.$elem.find('input[name="forenames"]').val( forenames );
			// trigger keyup handler to input
			_this.$elem.find('input[name="forenames"]').trigger( "keyup" );

		});

		// big publication literal highlighting
		//_this.$elem.find('label:contains("Veröffentlichungen / Publikationen")').first().parent().before("<div class='rdform-hidden-group'><legend>Veröffentlichungen, Literatur, Sonstiges</legend></div>");	

	},

	// on insert a existing resource into the form
	// get and return i and di for asynchronus call
	__insertResource : function( i, di, resource, callback ) {
		var _this = this;

		if ( ! resource.hasOwnProperty("@type") ) { // it seemms to be an external resource, get data from ontowiki
			_this.getResourceData( resource["@id"], function( data ){
				callback( i, di, data[0] );
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
	getResourceData : function( resourceUri, callback ) {
		var _this = this;

		if ( _this.isGetResourceBusy ) {
			// prev getResource is still busy, wait 200 ms
			// TODO: implement a max timout
			window.setTimeout(function(){ _this.getResourceData( resourceUri, callback ) },200);
		} else {
			_this.isGetResourceBusy = true;
			_this.getResourceDataFct( resourceUri, function(data) {
				callback(data);
				_this.isGetResourceBusy = false;
			} );
		}
	},

	// get data of resource from ontowiki, return as jsonld object
	getResourceDataFct : function( resourceUri, callback ) {
		owCon.getResource( modelIri, resourceUri, function( owConData ) {
			jsonld.fromRDF(
				owConData.data, 
				{format: 'application/nquads'},
				function(err, doc) {
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