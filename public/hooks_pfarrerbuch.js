// after model is parsed - init form handlers
__initFormHandlers = function () {

	// get pid from existing resource
	var resourceIri = $("#resourceIri").val();
	var pID = resourceIri.substring( resourceIri.indexOf("-") + 1 );
	rdform.find( 'input[name="id"]' ).val( pID );

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

