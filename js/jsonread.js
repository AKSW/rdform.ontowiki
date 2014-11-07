function OntoWikiConnection (urlBase){
    var self = this;
    this.urlBase = urlBase;
    
    // get resource from model. Callback returns the result
    this.getResource = function (modelIri, resourceIri, callback) {
        var meta = new $.JsonRpcClient({ ajaxUrl: this.urlBase + '/resource' });
        meta.call(
                'get', [modelIri, resourceIri, 'ntriples'],
                function(result) {                
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

    // update resource in model. Callback returns the success of the update
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
