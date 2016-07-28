<?php
/**
 * This file is part of the {@link http://ontowiki.net OntoWiki} project.
 *
 * @copyright Copyright (c) 2013, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 */

/**
 * Helper class for the History component.
 *
 * - register the tab for all navigations except the instances list
 *   (this should be undone if the history can be created from a Query2 too)
 *
 * @category OntoWiki
 * @package Extensions_History
 * @copyright Copyright (c) 2012, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 */
class RdformHelper extends OntoWiki_Component_Helper
{
    protected $_defaultHash = "40cd750bba9870f18aada2478b24840a";
    protected $_view = null;
    protected $_componentUrl = '' ;
    protected $_selectedModel = '';
    protected $_selectedResource = '';
    protected $_formTemplate = '';

    public function init()
    {

        $owApp = OntoWiki::getInstance();

        if ($owApp->lastRoute == 'properties' && $owApp->selectedResource != null) {
            $owApp->getNavigation()->register(
                'rdform',
                array(
                    'controller' => 'rdform',     // history controller
                    'action'     => 'index',        // list action
                    'name'       => 'RDForm',
                    'priority'   => 20
                )
            );
        }
    }

    /**
     * Init for site extension:
     * $rdform = $owApp->extensionManager->getComponentHelper('rdform');
     * $rdform->siteInit();
     */
    public function siteInit()
    {
        $this->_componentUrl = $this->_owApp->extensionManager->getComponentUrl('rdform');
        $this->_selectedModel = (string)$this->_owApp->selectedModel;
        $this->_selectedResource = (string)$this->_owApp->selectedResource;

        if (empty($this->_selectedModel) || empty($this->_selectedResource) ) {
            throw new Exception("RDForm requires selected model and ressource");
        }
        //$this->_owApp->logger->info('...');

        /*$viewRenderer = Zend_Controller_Action_HelperBroker::getStaticHelper('viewRenderer');
        if (null === $viewRenderer->view) {
            $viewRenderer->initView();
        }
        $this->_view = clone $viewRenderer->view;
        $this->_view->clearVars();*/

        $app = Erfurt_App::getInstance();
        $efModel = $app->getStore()->getModel($this->_selectedModel);

        $rdfType = $efModel->sparqlQuery( sprintf("SELECT * WHERE { <%s> <%s> ?o }", $this->_selectedResource, EF_RDF_NS . 'type' ) );
        
        if ( count($rdfType) < 1 ) {            
            throw new Exception( sprintf("RDForm requires \"%s\" for the resource \"%s\"" , EF_RDF_NS . 'type', $this->_selectedResource) );
        }
        //$this->_formTemplate = basename($rdfType[0]['o']);

        $classTemplate = $app->getStore()->sparqlQuery( sprintf("SELECT ?classTemplate WHERE {<%s> <%s> ?classTemplate}", $rdfType[0]['o'], "http://ns.ontowiki.net/SysOnt/Site/classTemplate" ) );

        if ( count($classTemplate) < 1 ) {
            throw new Exception( sprintf("RDForm requires \"%s\" for \"%s\"", "http://ns.ontowiki.net/SysOnt/Site/classTemplate", $rdfType[0]['o']) );
        }

        $this->_formTemplate = basename($classTemplate[0]['classTemplate']);


        /*
        // TODO, headLink and headScript prodouces errors on print in site (echo $this->headStyle();)        
        // through navigation extension will also init itself...
        $view->headLink()->appendStylesheet( $view->modulUrl . 'js/lib/rdform/css/bootstrap.min.css' );
        $view->headLink()->appendStylesheet( $view->modulUrl . 'js/lib/rdform/css/rdform.css' ); 
        $view->headLink()->appendStylesheet( $view->modulUrl . 'js/lib/rdform/css/css/smoothness/jquery-ui.custom.min.css' );        
        $view->headStyle()->appendStyle(
            '@font-face{' . PHP_EOL .
                'font-family:"Glyphicons Halflings";' . PHP_EOL .
                'src:url('. $view->modulUrl .'public/fonts/glyphicons-halflings-regular.eot);' . PHP_EOL .
                'src:url('. $view->modulUrl .'public/fonts/glyphicons-halflings-regular.eot?#iefix) format("embedded-opentype"),url('. $view->modulUrl .'public/fonts/glyphicons-halflings-regular.woff) format("woff"),url('. $view->modulUrl .'public/fonts/glyphicons-halflings-regular.ttf) format("truetype"),url('. $view->modulUrl .'public/fonts/glyphicons-halflings-regular.svg#glyphicons_halflingsregular) format("svg")
            }'
        );
        */

        //$view->headScript()->appendFile($view->modulUrl . 'js/lib/rdform/js/jquery.min.js');
        /* Include promise for IE compatibility */
        /*$view->headScript()->appendFile('//cdn.jsdelivr.net/g/es6-promise@1.0.0');
        $view->headScript()->appendFile($view->modulUrl . 'js/lib/jquery.jsonrpcclient.js/jquery.jsonrpcclient.js');
        $view->headScript()->appendFile($view->modulUrl . 'js/lib/rdform/js/jquery-ui.custom.min.js');
        $view->headScript()->appendFile($view->modulUrl . 'js/lib/jsonld.js/js/jsonld.js');
        $view->headScript()->appendFile($view->modulUrl . 'js/lib/rdform/js/rdform.js');
        $view->headScript()->appendFile($view->modulUrl . 'js/jsonread.js');
        $view->headScript()->appendFile($view->modulUrl . 'js/owrdform.js');

        $view->inlineScript()->appendScript(
            'var rdformConfig = ' . json_encode( $this->_privateConfig->toArray() ) .  ';' . PHP_EOL . 
            'var urlBase = "'. $this->_config->urlBase .'";' . PHP_EOL .
            'var modelIri = "' . $model . '";' . PHP_EOL .
            'var resourceTemplate = "'.$literalTemplate.'";' . PHP_EOL .
            'var resourceUri = "' . $resource . '";' . PHP_EOL .
            'var defaultHash = "40cd750bba9870f18aada2478b24840a";' . PHP_EOL . 
            'var navigationStateSetup = "undefined";' . PHP_EOL .
            'var navigationConfig = "undefined";' . PHP_EOL .
            'var navigationEvent = function() {};' . PHP_EOL .
            'var navigationSetup = "undefined";' . PHP_EOL
            //'var navigationContainer = new Object(); navigationContainer.removeClass = function() {};' . PHP_EOL
        );*/
    }

    /**
     * Prints stylesheets for frontend
     */
    public function getStyles()
    {
        $styles = array();
        $styles[] = $this->stylesheet($this->_componentUrl . 'js/lib/rdform/css/bootstrap.min.css');
        $styles[] = $this->stylesheet($this->_componentUrl . 'js/lib/rdform/css/rdform.css');
        $styles[] = $this->stylesheet($this->_componentUrl . 'js/lib/rdform/css/smoothness/jquery-ui.custom.min.css');
        $styles[] = '<style type="text/css" media="screen">' . PHP_EOL .
                '@font-face{' . PHP_EOL .
                    'font-family:"Glyphicons Halflings";' . PHP_EOL .
                    'src:url('. $this->_componentUrl .'public/fonts/glyphicons-halflings-regular.eot);' . PHP_EOL .
                    'src:url('. $this->_componentUrl .'public/fonts/glyphicons-halflings-regular.eot?#iefix) format("embedded-opentype"),url('. $this->_componentUrl .'public/fonts/glyphicons-halflings-regular.woff) format("woff"),url('. $this->_componentUrl .'public/fonts/glyphicons-halflings-regular.ttf) format("truetype"),url('. $this->_componentUrl .'public/fonts/glyphicons-halflings-regular.svg#glyphicons_halflingsregular) format("svg")
                }' . PHP_EOL .
            '</style>';

        return PHP_EOL . implode(PHP_EOL, $styles) . PHP_EOL;
    }

    /**
     * Pronts scripts for frontend 
     */
    public function getScripts()
    {
        $scripts = array();
        $scripts[] = '<script type="text/javascript">' . PHP_EOL .
                'var rdformConfig = ' . json_encode( $this->_privateConfig->toArray() ) .  ';' . PHP_EOL . 
                'var urlBase = "'. $this->_config->urlBase .'";' . PHP_EOL .
                'var modelIri = "' . $this->_selectedModel . '";' . PHP_EOL .
                'var resourceTemplate = "'.$this->_formTemplate.'";' . PHP_EOL .
                'var resourceUri = "' . $this->_selectedResource . '";' . PHP_EOL .
                'var defaultHash = "'. $this->_defaultHash .'";' . PHP_EOL . 
            '</script>' . PHP_EOL;
        $scripts[] = $this->script('//cdn.jsdelivr.net/g/es6-promise@1.0.0');
        $scripts[] = $this->script($this->_componentUrl . 'js/lib/jquery.jsonrpcclient.js/jquery.jsonrpcclient.js');
        $scripts[] = $this->script($this->_componentUrl . 'js/lib/rdform/js/jquery-ui.custom.min.js');
        $scripts[] = $this->script($this->_componentUrl . 'js/lib/jsonld.js/js/jsonld.js');
        $scripts[] = $this->script($this->_componentUrl . 'js/lib/rdform/js/rdform.js');
        $scripts[] = $this->script($this->_componentUrl . 'js/jsonread.js');
        $scripts[] = $this->script($this->_componentUrl . 'js/owrdform.js');        

        return PHP_EOL . implode(PHP_EOL, $scripts) . PHP_EOL;
    }

    protected function stylesheet($href)
    {
        return sprintf("<link href=\"%s\" media=\"screen\" rel=\"stylesheet\" type=\"text/css\" >", $href);
    }

    protected function script($src)
    {
        return sprintf("<script type=\"text/javascript\" src=\"%s\"></script>", $src);
    }
}

