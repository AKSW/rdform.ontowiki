

function OntoWikiConnection (urlBase){
    var self = this;
    this.urlBase = urlBase;    

    this.initRDForm = function ( data ) {
        $(".rdform").RDForm({
            template: parent.urlBase + "extensions/rdform/public/form_pfarrerbuch.html",
            hooks: parent.urlBase + "extensions/rdform/public/hooks_pfarrerbuch.js",
            //lang: parent.urlBase + "extensions/rdform/public/lang",
            data: data,

            submit: function() {
                var modelIri = $('#modelIri').val();
                var resourceIri = $('#resourceIri').val();
                var hash = $('#dataHash').val();
                
                self.updateResource( modelIri, resourceIri, hash, $(this)[0] );
                //console.log( this[0] );
            }
        });
    };

    this.getResource = function (modelIri, resourceIri) {
        var meta = new $.JsonRpcClient({ ajaxUrl: this.urlBase + '/resource' });
        meta.call(
                'get', [modelIri, resourceIri, 'ntriples'],
                function(result) {
                    $('#editable').prop('checked', result.editable);
                    $('#dataHash').val(result.dataHash);
                    jsonld.fromRDF(
                        result.data, 
                        {format: 'application/nquads'},
                        function(err, doc) {
                            self.initRDForm( doc );
                        }
                        );
                },
                function(error)  { console.log('There was an error', error); }
                );
    };

    this.getTitles = function (modelIri, resources) {
        var meta = new $.JsonRpcClient({ ajaxUrl: this.urlBase + '/model' });
        meta.call(
                'getTitles', [modelIri, resources],
                function(result) {
                    $('#jsonData').val(JSON.stringify(result));
                    /*$('#jsonData').val(result.data);*/
                },
                function(error)  { console.log('There was an error', error); }
                );
    };

    this.updateResource = function (modelIri, resourceIri, hash, data) {
        jsonld.toRDF(
                data, {format: 'application/nquads'},
                function(err, nquads) {
                    var meta = new $.JsonRpcClient({ ajaxUrl: self.urlBase + '/resource' });
                    meta.call(
                        'update', [modelIri, resourceIri, nquads, hash, 'ntriples'],
                        function(result) {
                            var redirectUri = $("#redirectUri").val();
                            window.location.href = decodeURIComponent(redirectUri);
                        },
                        function(error)  { console.log('There was an error', error); }
                        );
                }
                );
    };
};
