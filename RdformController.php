<?php

/**
 *
 * @category OntoWiki
 * @package Extensions_RDForm
 * TODO comments
 */

class RdformController extends OntoWiki_Controller_Component
{
    public function init()
    {
        $logger = OntoWiki::getInstance()->logger;
        $logger->debug('Initializing RDForm Controller');

        parent::init();
    }

    public function indexAction()
    {
        $owApp = OntoWiki::getInstance();
        
        //$this->view->headLink()->appendStylesheet( $owApp->extensionManager->getComponentUrl('rdform') . 'js/lib/rdform/css/bootstrap.min.css' );
        $this->view->headLink()->appendStylesheet( $owApp->extensionManager->getComponentUrl('rdform') . 'js/lib/rdform/css/rdform.css' );

        $this->view->headScript()->appendFile($owApp->extensionManager->getComponentUrl('rdform') . 'js/lib/jquery.jsonrpcclient.js/jquery.jsonrpcclient.js');
        $this->view->headScript()->appendFile($owApp->extensionManager->getComponentUrl('rdform') . 'js/lib/jsonld.js/js/jsonld.js');
        $this->view->headScript()->appendFile($owApp->extensionManager->getComponentUrl('rdform') . 'js/lib/rdform/js/rdform.js');
        $this->view->headScript()->appendFile($owApp->extensionManager->getComponentUrl('rdform') . 'js/jsonread.js');

        $this->view->selectedModel = $owApp->selectedModel;
    }
}
