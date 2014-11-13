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

		// get pid from existing resource and set as id if its the old integer resource...
		var resourceIri = _this.$elem.data("resourceIri");
		if ( typeof resourceIri !== 'undefined' ) {
			var pID = resourceIri.split('/').reverse()[0];
			/*if ( typeof pID === 'number' ) {
				pID = Math.abs( pID );
				
			} else {
				pID = pID.replace(/^-/g, "");
			}*/
			pID = pID.replace(/^-/g, "");
			_this.$elem.find( 'input[name="id"]' ).val( pID );
		}

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

		// add external-links and create buttons
		_this.$elem.find( 'input[external]' ).each(function() {
			/*
			$(this).nextAll(".duplicate-external-resource").hide();
			$(this).nextAll(".remove-external-resource").hide();
			*/			

			if ( ( $(this).val() == ""  || $(this).attr("multiple") )
				 && $(this).attr("typeof") == "http://xmlns.com/foaf/0.1/PersonEasy"
			) { 
				// add create-new-bnt
				var newExtResBtn = $('<button type="button" class="btn btn-default btn-xs create-new-external-resource" title=""><span class="glyphicon glyphicon-plus"></span> create</button>');
				$(this).after(newExtResBtn);
				_this.newExtResBtn( $(this), newExtResBtn );
			}

			// create links to the external resource
			if ( $(this).val() != "" ) {
				$(this).hide();
				
				var thisResource = $(this);
				//var resLink = urlBase + "view/?r=" + $(thisResource).val()
				var resLink = $(thisResource).val()
				var meta = new $.JsonRpcClient({ ajaxUrl: urlBase + 'jsonrpc/resource' });
		        meta.call(
					'get', [modelIri, $(thisResource).val(), 'ntriples'],
					function(result) {
						jsonld.fromRDF(
							result.data, 
							{format: 'application/nquads'},
							function(err, doc) {
								if ( doc.length > 0 && doc[0].hasOwnProperty("http://www.w3.org/2000/01/rdf-schema#label") ) {
									console.log( doc );
									if ( doc[0]["@type"][0] ==  "http://purl.org/voc/hp/Position" ) {
										$(thisResource).before('<a href="'+resLink+'">{Ort}, '+doc[0]["http://www.w3.org/2000/01/rdf-schema#label"][0]["@value"]+'</a>');
									} else {
										$(thisResource).before('<a href="'+resLink+'">'+doc[0]["http://www.w3.org/2000/01/rdf-schema#label"][0]["@value"]+'</a>');
									}
								} else {
									var resLabel = $(thisResource).val();
									var resDir = resLabel.substring( 0, resLabel.lastIndexOf("/"));
									resDir = resDir.substring( resDir.lastIndexOf("/")+1 );
									resLabel = resLabel.substring( resLabel.lastIndexOf("/")  );
									$(thisResource).before('<a href="'+resLink+'">'+resDir+resLabel+'</a>');
								}
							}
						);
					},
					function(error)  { console.log('There was an error', error); }
				);
			} 
		});	

	},

	newExtResBtn : function( res, btn ) {
		
		btn.click(function() {

			res.hide();
			btn.hide();

			var modelIri = $("#modelIri").val();
			var container = res.parent();			
			var template = "form_pfarrerbuch-" + $(res).attr("typeof").split('/').reverse()[0] + ".html";

			var owRdform = new OntoWikiRDForm({
				$container: container,
				template: template,
				hooks: "hooks_pfarrerbuch.js"
			});
			owRdform.init( function(result){ 
				var hash = '40cd750bba9870f18aada2478b24840a';
				owCon.updateResource( modelIri, result["@id"], hash, result, function( updateResult ) {
					owRdform.settings.$elem.remove();
					res.val( result["@id"] );
					res.show();
				});
			});
		});
	},

	// after the addLiteral button was clicked
	__afterAddLiteral : function ( thisLiteral ) {
		var _this = this;
	},

	// after the duplicateLiteral button was clicked
	__afterDuplicateLiteral : function ( thisLiteral ) {
		var _this = this;		
	},

	// after the addClass button was clicked
	__afterAddClass : function ( thisResource ) {
		var _this = this;
	},

	// after the duplicateClass button was clicked
	__afterDuplicateClass : function ( thisClass ) {
		var _this = this;
	},

	// after the duplicateExternalResource button was pressed
	__afterDuplicateExternalResource : function ( thisResource ) {
		var _this = this;

		// rempve btn create-new-ext-res
		$(thisResource).find(".create-new-external-resource").remove();

		// show inputs if hidden
		$(thisResource).find("input").show();
		// remove link to existing ext res
		$(thisResource).find("a").remove();
	},

	// validate form-input on change value or on submit the form
	__userInputValidation : function ( property ) {
		var _this = this;
		// return false if property value is not valid
	},

	__autocompleteGetItem : function( item ) {
		//console.log( "hook ac: ", item );

		if ( item.hasOwnProperty("posLabel") ) {
			item.label.value = item.label.value + ", " + item.posLabel.value;
		}
		else if ( item.hasOwnProperty("schoolLabel") ) {
			item.label.value = item.label.value + ", " + item.schoolLabel.value;
		}

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
} // end of hooks

/*
RDForm_Hooks class. Normally you dont need to edit this
*/
function RDForm_Hooks( rdform ) {
	this.rdform = rdform;
	this.$elem = rdform.$elem;
	return this;
}