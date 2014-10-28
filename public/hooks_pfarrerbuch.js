// after model is parsed - init form handlers
__initFormHandlers = function () {

	// get pid from existing resource
	var resourceIri = $("#resourceIri").val();
	var pID = resourceIri.substring( resourceIri.indexOf("-") + 1 );
	rdform.find( 'input[name="id"]' ).val( pID );
	
	rdform.on("keyup", 'input[name="http://purl.org/voc/hp/birthDate"]', function() {
		var bYear = $(this).val().slice(0, 4);
		rdform.find('input[name="birthDate"]').val( bYear ).trigger("keyup");
	});	

	rdform.on("keyup", 'input[name="http://purl.org/voc/hp/dateOfDeath"]', function() {
		var dYear = $(this).val().slice(0, 4);
		rdform.find('input[name="deathDate"]').val( dYear ).trigger("keyup");
	});	
	

}

__afterInsertData = function() {
	
	var modelIri = $('#modelIri').val();
	var urlBase = $('#urlBase').val();	

	rdform.find( 'input[external]' ).each(function() {
		$(this).hide();
		$(this).nextAll(".duplicate-external-resource").hide();
		$(this).nextAll(".remove-external-resource").hide();
		if ( $(this).val() != "" ) {			
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
								//thisResource.attr( "title", doc[0]["http://www.w3.org/2000/01/rdf-schema#label"][0]["@value"]  ) ;
								$(thisResource).before('<a href="'+resLink+'">'+doc[0]["http://www.w3.org/2000/01/rdf-schema#label"][0]["@value"]+'</a>');
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
	
}

__afterDuplicateExternalResource = function ( thisResource ) {

	$(thisResource).find("input").show();
	$(thisResource).find("a").remove();

}

// after pressing the duplicate button
__afterDuplicateClass = function ( thisClass ) {
	
}

// before creating the class properties from input values
__createResultClassProperty = function( propertyContainer ) {

}

// before generating the class object from input values and properties
__createClass = function ( thisClass ) {
	
	$(thisClass).attr( "resource", $(thisClass).attr( "resource").replace( " ", "_") );

}

