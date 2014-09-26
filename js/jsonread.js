

function OntoWikiConnection (urlBase){
    var self = this;
    this.urlBase = urlBase;

    $(".rdform").RDForm({
        model: parent.urlBase + "extensions/rdform/public/form_pfarrerbuch.html",
        hooks: parent.urlBase + "extensions/rdform/public/hooks_pfarrerbuch.js",

        submit: function() {
            var modelIri = $('#modelIri').val();
            var resourceIri = $('#resourceIri').val();
            var hash = $('#dataHash').val();
            self.updateResource( modelIri, resourceIri, hash, $(this)[0] );
        }
    });

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

                            // need this for correct compaction
                            /*var context = {
                                "http://xmlns.com/foaf/0.1/id" : {
                                    "@type" : "http://www.w3.org/2001/XMLSchema#integer"
                                }
                            };*/                            
                            var context = {};
                            jsonld.compact(doc, context, function(err, compacted) {
                                //$("#jsonResult").val( JSON.stringify(compacted, null, '\t') );
                                RDForm.addExistingData( undefined, compacted );
                            });
                        }
                        );
                },
                function(error)  { console.log('There was an error', error); }
                );
    };

    this.updateResource = function (modelIri, resourceIri, hash, data) {
        //data = JSON.parse(data);
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
