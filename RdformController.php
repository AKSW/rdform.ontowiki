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
        $this->view->headScript()->appendFile($owApp->extensionManager->getComponentUrl('rdform') . 'js/lib/jquery.jsonrpcclient.js/jquery.jsonrpcclient.js');
        $this->view->headScript()->appendFile($owApp->extensionManager->getComponentUrl('rdform') . 'js/lib/jsonld.js/js/jsonld.js');
        $this->view->headScript()->appendFile($owApp->extensionManager->getComponentUrl('rdform') . 'js/jsonread.js');

        $this->view->selectedModel = $owApp->selectedModel;
    }
}
