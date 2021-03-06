// This file is part of Moodle - http://moodle.org/.
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle. If not, see <http://www.gnu.org/licenses/>.

/**
 * @package mod
 * @subpackage organizer
 * @copyright 2017 Thomas Niedermaier (thomas.niedermaier@gmail.com)
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Tab appointments view and students view: Load slot list according to view options stored in user prefs.
 */


define(
    ['jquery', 'core/config', 'core/log'], function($, config, log) {

        /**
     * @constructor
     * @alias module:mod_organizer/initinfobox
     */
        var Initinfobox = function() {};

        var instance = new Initinfobox();

        instance.init = function () {

            // What happens when a view option checkbox is clicked or the filter field has been changed.
            function toggle_all_slots() {
                var tablebody = $('#slot_overview tbody');
                var showpastslots = $('#show_past_slots').is(':checked');
                var showmyslotsonly = $('#show_my_slots_only').is(':checked');
                var showfreeslotsonly = $('#show_free_slots_only').is(':checked');
                var showhiddenslots = $('#show_hidden_slots').is(':checked');

                tablebody.find('tr').show();

                if (!showhiddenslots) {
                    tablebody.find('tr:not(.info).unavailable').hide();
                }

                if (!showpastslots) {
                    tablebody.find('tr.past_due').hide();
                }

                if (showmyslotsonly) {
                    tablebody.find('tr.not_my_slot').hide();
                }

                if (showfreeslotsonly) {
                    tablebody.find('tr.not_free_slot').hide();
                }

                var target = $('.organizer_filtertable');
                if (target) {
                    var filter = target.val().toUpperCase();
                    if (filter) {
                        var tr = tablebody.find('tr:visible:not(.info)');
                        // Loop through all table rows, and hide those who don't match the search query.
                        var i, j, td, text, found;
                        for (i = 0; i < tr.length; i++) {
                            found = false;
                            td = tr[i].getElementsByTagName("td");
                            if (td) {
                                for (j = 0; j < td.length; j++) {
                                    text = extracttext(td[j]);
                                    if (text) {
                                        if (text.toUpperCase().indexOf(filter) > -1) {
                                            found = true;
                                            break;
                                        }
                                    }
                                }
                            }
                            if (!found) {
                                $(tr[i]).hide();
                            }
                        }
                    }
                }

                tablebody.show();

                toggle_info();

                set_user_preference('mod_organizer_showhiddenslots', (showhiddenslots));
                set_user_preference('mod_organizer_showmyslotsonly', (showmyslotsonly));
                set_user_preference('mod_organizer_showfreeslotsonly', (showfreeslotsonly));
                set_user_preference('mod_organizer_showpasttimeslots', (showpastslots));

            }

            function toggle_info() {
                var tablebody = $('#slot_overview tbody');
                var noninforows = tablebody.find('tr:not(.info)');
                var noneexist = noninforows.length === 0;
                var anyvisible = false;

                noninforows.each(
                    function () {
                        if (!(
                                $( this ).css('offsetWidth') === 0 &&
                                $( this ).css('offsetHeight') === 0) ||
                                $( this ).css('display') === 'none'
                        ) {
                            anyvisible = true;
                        }
                    }
                );

                var showpastslots = $('#show_past_slots').is(':checked');
                var showmyslotsonly = $('#show_my_slots_only').is(':checked');

                tablebody.find('tr.info').hide();
                if (!anyvisible) {
                    if (noneexist) {
                        tablebody.find('tr.no_slots_defined').show();
                    } else if (showpastslots && !showmyslotsonly) {
                        tablebody.find('tr.no_slots').show();
                    } else if (showpastslots && showmyslotsonly) {
                        tablebody.find('tr.no_my_slots').show();
                    } else if (!showpastslots && showmyslotsonly) {
                        tablebody.find('tr.no_due_my_slots').show();
                    } else {
                        tablebody.find('tr.no_due_slots').show();
                    }
                }
            }

            // Extract visible text from 'element' down thru DOM tree.
            function extracttext(element) {
                var text, last, img;

                last = $(element).clone().find("script,style").remove().end();
                text = last.text();
                if (!text) {
                    img = last.find('img:not(.icon)').first();
                    var attr = img.attr('alt');
                    if (typeof attr !== typeof undefined && attr !== false) {
                        text = attr;
                    }
                }
                return text;
            }

            $('#show_past_slots').on('click', toggle_all_slots);
            $('#show_my_slots_only').on('click', toggle_all_slots);
            $('#show_free_slots_only').on('click', toggle_all_slots);
            $('#show_hidden_slots').on('click', toggle_all_slots);
            $('.organizer_filtertable').on('keyup', toggle_all_slots);

            toggle_all_slots();

            function set_user_preference(name, value) {

                $.get( config.wwwroot + '/lib/ajax/setuserpref.php', {
                    sesskey: config.sesskey,
                    pref: encodeURI(name),
                    value: encodeURI(value)
                } , 'json').done(function( data ) {
                    if (data != 'OK') {
                        log.error(data);
                    }
                });

            }
        };

        return instance;

    }
);
