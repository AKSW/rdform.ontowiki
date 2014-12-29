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

		//set model baseIri
		_this.rdform.MODEL[0]["@context"]["@base"] = modelIri;

		// get pid from existing resource and set as id if its the old integer resource...
		var resourceIri = _this.$elem.data("resourceIri");
		if ( typeof resourceIri !== 'undefined' ) {
			var pID = resourceIri.split('/').reverse()[0];
			/*if ( typeof pID === 'number' ) {
				pID = Math.abs( pID );
				
			} else {
				pID = pID.replace(/^-/g, "");
			}*/
			//pID = pID.replace(/^-/g, "");
			_this.$elem.find( 'input[name="id"]' ).val( pID );
		} else {			
			var idInput = _this.$elem.find( 'input[name="id"]' );
			if ( idInput.length > 0 && idInput.val() == "" ) {
				var iD = new Date();
				idInput.val( iD.getTime() );
			}
		}

		// set id and persiniri for Events: hasPosition and attendedSchool
		if (_this.$elem.children("div").attr("typeof") == "http://purl.org/voc/hp/Event") {
			var eID = new Date();
			_this.$elem.find( 'input[name="id"]' ).val( eID.getTime() );
			//var personIri = $('div[typeof="http://xmlns.com/foaf/0.1/Person"]').find('input[name="id"]').val();
			var pClass = $('div[typeof="http://xmlns.com/foaf/0.1/Person"]');
			var personIri = _this.rdform.replaceWildcards( pClass.attr("resource"), pClass );
			//console.log(personIri);
			_this.$elem.find( 'input[name="personIri"]' ).val( personIri["str"] );
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

		// new hasPosition or attendedSchool subform on focus the external input
		_this.$elem.on("focus", "input[autocomplete]", function() {			
			if ( $(this).attr("name") == "http://purl.org/voc/hp/hasPosition" || 
				 $(this).attr("name") == "http://purl.org/voc/hp/attendedSchool" ) {
				//console.log("append new hasPosition form");
				var hasPostBtn = $('<button></button>');
				_this.newExtResBtn( $(this), hasPostBtn );
				hasPostBtn.trigger("click");
			}
		});

		// add label to form legend
		/*_this.$elem.on("change", 'input[name="http://www.w3.org/2000/01/rdf-schema#label"]', function() {
			//_this.$elem.find("legend").append(" " + $(this).val() );
			console.log( $(this).val() );
		});*/
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
				var newExtResBtn = $('<button type="button" class="btn btn-default btn-xs create-new-external-resource" title=""><span class="glyphicon glyphicon-file"></span> neu</button>');
				$(this).after(newExtResBtn);
				_this.newExtResBtn( $(this), newExtResBtn );
			}

			// create links to the external resource
			if ( $(this).val() != "" ) {
				$(this).hide();
				
				if ( ! $(this).attr("multiple") || ( $(this).attr("multiple") && $(this).attr("index") == 1 ) ) {
					$(this).after('<button type="button" class="btn btn-link btn-xs remove-first-external-resourcelink" title=""><span class="glyphicon glyphicon-remove"></span> entfernen</button>');
				}

				var thisResource = $(this);
				var resLink = $(thisResource).val()
				_this.getResourceData( $(thisResource).val(), function( data ){
					//console.log( data );
					if ( data.length > 0 ) {
						if ( data[0]["@type"][0] ==  "http://purl.org/voc/hp/Position" ) {
							_this.getResourceData( data[0]["http://purl.org/voc/hp/place"][0]["@id"], function( ortData ){
								var fromTo = "";
								$.ajax({
									url: "http://pfarrerbuch.comiles.eu/sparql",
									dataType: "json",
									data: {
										query: "SELECT DISTINCT * WHERE {  ?event <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/voc/hp/Event> ; <http://www.w3.org/1999/02/22-rdf-syntax-ns#subject> <"+_this.rdform.settings.data[0]["@id"]+"> ; <http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate> <http://purl.org/voc/hp/hasPosition> ; <http://www.w3.org/1999/02/22-rdf-syntax-ns#object> <"+data[0]["@id"]+"> . OPTIONAL { ?event <http://purl.org/voc/hp/start> ?start . } OPTIONAL { ?event <http://purl.org/voc/hp/end> ?end . } }",
										format: "json"
									},
									success: function( data ) {
										$.map( data.results.bindings, function( item ) {
											if ( item.hasOwnProperty("start") ) {
												fromTo += item.start.value.substring(0, 4);
											}
											if ( item.hasOwnProperty("end") ) {
												fromTo += " - " + item.end.value.substring(0, 4);
											}
										});
									},
									error: function(e) {
										console.log( 'Error on autocomplete: ' + e );
									},
									complete: function() {
										$(thisResource).before('<a href="'+resLink+'">'+ortData[0]["http://www.w3.org/2000/01/rdf-schema#label"][0]["@value"]+', '+data[0]["http://www.w3.org/2000/01/rdf-schema#label"][0]["@value"]+' ('+ fromTo +')</a>');
									},
								});
							});
						} else if ( data[0]["@type"][0] ==  "http://purl.org/voc/hp/School" ) {
							_this.getResourceData( data[0]["http://purl.org/voc/hp/place"][0]["@id"], function( ortData ){
								$(thisResource).before('<a href="'+resLink+'">'+data[0]["http://purl.org/voc/hp/schoolType"][0]["@value"]+', '+ortData[0]["http://www.w3.org/2000/01/rdf-schema#label"][0]["@value"]+'</a>');
							});
						} else if ( data[0].hasOwnProperty("http://www.w3.org/2000/01/rdf-schema#label") ) {
							$(thisResource).before('<a href="'+resLink+'">'+data[0]["http://www.w3.org/2000/01/rdf-schema#label"][0]["@value"]+'</a>');
						} else {
							$(thisResource).before('<a href="'+resLink+'">'+$(thisResource).val().split('/').reverse()[0]+'</a>');
						}
						//$(thisResource).after(' <button type="button" class="btn btn-link btn-xs edit-external-resource" title=""><span class="glyphicon glyphicon-pencil"></span>  bearbeiten</button>');
					} else {
						var resLabel = $(thisResource).val();
						var resDir = resLabel.substring( 0, resLabel.lastIndexOf("/"));
						resDir = resDir.substring( resDir.lastIndexOf("/")+1 );
						resLabel = resLabel.substring( resLabel.lastIndexOf("/")  );
						$(thisResource).before('<a href="'+resLink+'">'+resDir+resLabel+'</a>');
					}
				});
			}
		});	

		// autocorrect wrong gYear dates (XXXX-01-01T00:00:00Z)
		_this.$elem.find( 'input[datatype="xsd:date"]' ).each(function() {
			if ( $(this).val().search(/.*-01-01T00:00:00.*/) != -1 ) {
				$(this).val( $(this).val().substring(0,4) );
			} else if ( $(this).val().search(/.*-01T00:00:00.*/) != -1 ) {
				$(this).val( $(this).val().substring(0,7) );
			}
		});

		$("body").on("click", ".remove-first-external-resourcelink", function() {
			$(this).parent().find("a").remove();
			$(this).parent().find("input").show().val("");
			$(this).remove();
		});

		$("body").on("click", ".edit-external-resource", function() {
			var modelIri = $("#modelIri").val();
			var thisResouce = $(this).parent().find("input");
			var resourceIri = $(thisResouce).val();
			var container = $('<div class="rdform-subform"></div>')
			thisResouce.before(container);
			//var template = "form_pfarrerbuch-" + $(this).attr("data-resourceTemplate") + ".html";
			var template = "form_pfarrerbuch-hasPosition.html";
			console.log(resourceIri);

			owCon.getResource( modelIri, resourceIri, function( resData ) {
				var hash = resData.dataHash;
				var owRdform = new OntoWikiRDForm({
					$container: container,
					template: template,
					hooks: "hooks_pfarrerbuch.js",
					lang: "pfarrerbuch_de.js",
					data: resData.data
				});
				console.log(resData);
			});
			/*			
			$(this).parent().find("a").remove();
			$(this).parent().find("input").show().val("");
			$(this).remove();
			*/
		});

	},

	getResourceData : function( resourceUri, callback ) {
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

	newExtResBtn : function( res, btn ) {
		
		btn.click(function() {

			res.hide();
			btn.hide();

			var modelIri = $("#modelIri").val();
			//var container = res.parent();
			var container = $('<div class="rdform-subform"></div>')
			res.before(container);
			var template = "form_pfarrerbuch-" + $(res).attr("typeof").split('/').reverse()[0] + ".html";

			var owRdform = new OntoWikiRDForm({
				$container: container,
				template: template,
				hooks: "hooks_pfarrerbuch.js",
				lang: "pfarrerbuch_de.js",
			});
			owRdform.init( function(result){ 
				var hash = '40cd750bba9870f18aada2478b24840a';
				
				owCon.updateResource( modelIri, result["@id"], hash, result, function( updateResult ) {
					//owRdform.settings.$elem.remove();
					container.remove();
					if ( result["@type"] == "http://purl.org/voc/hp/Event" ) {
						res.val( result["http://www.w3.org/1999/02/22-rdf-syntax-ns#object"][0]["@id"] );
					} else {
						res.val( result["@id"] );	
					}					
					res.show();
				});
			});
			owRdform.settings.$elem.find(".rdform-submit-btn-group div").prepend('<button type="reset" class="btn btn-default close-subrdform-btn">Abbrechen</button>  ');
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

		$(thisResource).find(".remove-first-external-resourcelink").remove();

		$(thisResource).find(".edit-external-resource").remove();		

		/*console.log( thisResource );
		//var resourceInputType = $(thisResource).find("input").attr("name");
		if ( $(thisResource).find("input").attr("name") == "http://purl.org/voc/hp/hasPosition" ) {
				//console.log("append new hasPosition form");
				var hasPostBtn = $('<button></button>');
				_this.newExtResBtn( $(thisResource).find("input"), hasPostBtn );
				hasPostBtn.trigger("click");
			}*/

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