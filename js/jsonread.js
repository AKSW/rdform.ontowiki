

function OntoWikiConnection (urlBase){
    var self = this;

    this.urlBase = urlBase;

    $(".rdform").RDForm({
        model: parent.urlBase + "extensions/rdform/public/form.html",
        //data: compacted,
        hooks: parent.urlBase + "extensions/rdform/public/hooks.js",
        //lang: "de"
    });

    this.getResource = function (modelIri, resourceIri) {
        var meta = new $.JsonRpcClient({ ajaxUrl: this.urlBase + '/resource' });
        meta.call(
                'get', [modelIri, resourceIri, 'ntriples'],
                function(result) {
                    $('#editable').prop('checked', result.editable);
                    $('#dataHash').val(result.dataHash);
                    //console.log(result);
                    jsonld.fromRDF(
                        result.data, 
                        {format: 'application/nquads'},
                        function(err, doc) {
                            //$('#jsonData').val(JSON.stringify(doc, null, 2));

                            // need this for correct compaction
                            /*var context = {
                                "http://xmlns.com/foaf/0.1/id" : {
                                    "@type" : "http://www.w3.org/2001/XMLSchema#integer"
                                }
                            };*/
                            var context = {};
                            jsonld.compact(doc, context, function(err, compacted) {
                                
                                //console.log(compacted);

                                

                                RDForm.addExistingData( undefined, compacted );
                            });
                        }
                        );
                },
                function(error)  { console.log('There was an error', error); }
                );
    };

    this.updateResource = function (modelIri, resourceIri, hash, data) {
        data = JSON.parse(data);
        jsonld.toRDF(
                data, {format: 'application/nquads'},
                function(err, nquads) {
                    var meta = new $.JsonRpcClient({ ajaxUrl: self.urlBase + '/resource' });
                    meta.call(
                        'update', [modelIri, resourceIri, nquads, hash, 'ntriples'],
                        function(result) {
                            //$('#jsonData').val(result);
                            $(".rdform-result textarea").val( result );
                        },
                        function(error)  { console.log('There was an error', error); }
                        );
                }
                );
    };
};
