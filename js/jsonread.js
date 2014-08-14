function OntoWikiConnection (urlBase){
    var self = this;

    this.urlBase = urlBase;

    this.getResource = function (modelIri, resourceIri) {
        var meta = new $.JsonRpcClient({ ajaxUrl: this.urlBase + '/resource' });
        meta.call(
                'get', [modelIri, resourceIri, 'ntriples'],
                function(result) {
                    $('#editable').prop('checked', result.editable);
                    $('#dataHash').val(result.dataHash);
                    jsonld.fromRDF(
                        result.data, {format: 'application/nquads'},
                        function(err, doc) {
                            $('#jsonData').val(JSON.stringify(doc));
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
                            $('#jsonData').val(result);
                        },
                        function(error)  { console.log('There was an error', error); }
                        );
                }
                );
    };
};
