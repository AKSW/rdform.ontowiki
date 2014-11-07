function OntoWikiRDForm (){
	var self = this;	
	self.$container = $(".active-tab-content"); /// the container element for the form. In OntoWiki by default the content of the active tab
	self.$elem = null; // the form element
	var rdformId = null;

	// public function to init a new form. Callback returns the submitted result of the form
	this.initForm = function ( resourceIri, data, callback ) {
		var now = new Date();
		rdformId = "rdform-" + now.getTime();

		if ( ! self.$elem ) {
			self.$elem = $('<form id="'+rdformId+'" class="rdform form-horizontal" onsubmit="return false;"></form>');	
		}

		self.$elem.append('<input type="hidden" id="resourceIri" value="'+resourceIri+'" />');
		self.$elem.append('<input type="hidden" id="dataHash" value="'+data.dataHash+'" />');
		self.$elem.append('<input type="hidden" id="editable" value="'+data.editable+'" />');

		self.$container.append(self.$elem);

		jsonld.fromRDF( data.data,  {format: 'application/nquads'},
			function(err, data) {
				newForm(data, function(res) { callback( res ) } );                        
			}
		);		
    };

    // private function creates the form.
    function newForm( data, callback) {
    	self.$elem.RDForm({
            template: urlBase + "extensions/rdform/public/form_pfarrerbuch.html",
            hooks: urlBase + "extensions/rdform/public/hooks_pfarrerbuch.js",
            //lang: parent.urlBase + "extensions/rdform/public/lang",
            data: data,

            submit: function() {
                callback( this[0] );
            }
        });
    };

};