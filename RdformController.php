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
        $model = $owApp->selectedModel;
        $resource = $owApp->selectedResource;        

        if (empty($model) || empty($resource) ) {
            $this->_abort('No model/resource selected.', OntoWiki_Message::ERROR);
        }
        
        $this->view->headLink()->appendStylesheet( $owApp->extensionManager->getComponentUrl('rdform') . 'js/lib/rdform/css/bootstrap.min.css' );
        $this->view->headLink()->appendStylesheet( $owApp->extensionManager->getComponentUrl('rdform') . 'js/lib/rdform/css/rdform.css' );
        //$this->view->headLink()->appendStylesheet( $owApp->extensionManager->getComponentUrl('rdform') . 'js/lib/rdform/css/css/smoothness/jquery-ui.custom.min.css' );

        /* Include promise for IE compatibility */
        $this->view->headScript()->appendFile('//cdn.jsdelivr.net/g/es6-promise@1.0.0');
        $this->view->headScript()->appendFile($owApp->extensionManager->getComponentUrl('rdform') . 'js/lib/jquery.jsonrpcclient.js/jquery.jsonrpcclient.js');
        //$this->view->headScript()->appendFile($owApp->extensionManager->getComponentUrl('rdform') . 'js/lib/rdform/js/jquery-ui.custom.min.js');
        $this->view->headScript()->appendFile($owApp->extensionManager->getComponentUrl('rdform') . 'js/lib/jsonld.js/js/jsonld.js');
        $this->view->headScript()->appendFile($owApp->extensionManager->getComponentUrl('rdform') . 'js/lib/rdform/js/rdform.js');
        $this->view->headScript()->appendFile($owApp->extensionManager->getComponentUrl('rdform') . 'js/jsonread.js');
        $this->view->headScript()->appendFile($owApp->extensionManager->getComponentUrl('rdform') . 'js/owrdform.js');

        $this->view->selectedModel = $model;
        $this->view->selectedResource = $resource;

        $url = new OntoWiki_Url(array('route' => 'properties'), array());
        $url->setParam('r', (string)$resource, true);
        $this->view->redirectUri = urlencode((string)$url);
    }

    /**
     * Shortcut for adding messages
     */
    private function _abort($msg, $type = null, $redirect = null)
    {
        if (empty($type)) {
            $type = OntoWiki_Message::INFO;
        }

        $this->_owApp->appendMessage(
            new OntoWiki_Message(
                $msg,
                $type
            )
        );

        if (empty($redirect)) {
            if ($redirect !== false) {
                $this->_redirect($this->_config->urlBase);
            }
        } else {
            $this->redirect((string)$redirect);
        }

        return true;
    }

    public function titlesAction()
    {
        $owApp = OntoWiki::getInstance();
        /* Include promise for IE compatibility */
        $this->view->headScript()->appendFile('//cdn.jsdelivr.net/g/es6-promise@1.0.0');
        $this->view->headScript()->appendFile($owApp->extensionManager->getComponentUrl('rdform') . 'js/lib/jquery.jsonrpcclient.js/jquery.jsonrpcclient.js');
        $this->view->headScript()->appendFile($owApp->extensionManager->getComponentUrl('rdform') . 'js/lib/jsonld.js/js/jsonld.js');
        $this->view->headScript()->appendFile($owApp->extensionManager->getComponentUrl('rdform') . 'js/jsonread.js');

        $this->view->selectedModel = $owApp->selectedModel;
    }
}
