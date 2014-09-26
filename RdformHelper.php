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
}

