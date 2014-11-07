function OntoWikiConnection (urlBase){
    var self = this;
    this.urlBase = urlBase;
    
    this.getResource = function (modelIri, resourceIri, callback) {
        //var data = null;
        var meta = new $.JsonRpcClient({ ajaxUrl: this.urlBase + '/resource' });
        meta.call(
                'get', [modelIri, resourceIri, 'ntriples'],
                function(result) {
                    $('#editable').prop('checked', result.editable);
                    $('#dataHash').val(result.dataHash);
                    callback( result );
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
                    //$('#jsonData').val(result.data);
                },
                function(error)  { console.log('There was an error', error); }
                );
    };

    this.updateResource = function (modelIri, resourceIri, hash, data, callback) {
        jsonld.toRDF(
                data, {format: 'application/nquads'},
                function(err, nquads) {
                    var meta = new $.JsonRpcClient({ ajaxUrl: self.urlBase + '/resource' });
                    meta.call(
                        'update', [modelIri, resourceIri, nquads, hash, 'ntriples'],
                        function(result) {
                            callback(result);
                        },
                        function(error)  { console.log('There was an error', error); }
                        );
                }
                );
    };
};
