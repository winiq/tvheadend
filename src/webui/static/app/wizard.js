/*
 * Wizard
 */

tvheadend.wizard_start = function(page) {

    var w = null;

    function cancel(conf) {
        tvheadend.Ajax({
            url: 'api/wizard/cancel'
        });
        tvheadend.wizard = null;
        if (conf.win)
            conf.win.close();
    }

    function getparam(data, prefix) {
        var m = data.params;
        var l = prefix.length;
        for (var i = 0; i < m.length; i++) {
            var id = m[i].id;
            if (id.substring(0, l) === prefix)
                return id.substring(l, 32);
        }
        return null;
    }

    function newpage(conf, prefix) {
        var p = getparam(conf.fullData, prefix);
        if (p)
            tvheadend.wizard_start(p);
        else
            Ext.MessageBox.alert(String.format(_('Wizard - page "{0}" not found'), prefix));
    }

    function buildbtn(conf, buttons) {
        if (!getparam(conf.fullData, 'page_prev_'))
            return;
        var prevBtn = new Ext.Button({
            text: _('Previous'),
            iconCls: 'previous',
            handler: function() {
                newpage(conf, 'page_prev_');
            },
        });
        buttons.splice(0, 0, prevBtn);
    }
    
    function build(d) {
        d = json_decode(d);
        var m = d[0];
        var last = getparam(m, 'page_next_') === null;
        tvheadend.idnode_editor_win('basic', m, {
            fullData: m,
            url: 'api/wizard/' + page,
            winTitle: m.caption,
            iconCls: 'wizard',
            comet: m.events,
            noApply: true,
            noUIlevel: true,
            postsave: function(conf) {
                if (!last)
                    newpage(conf, 'page_next_');
                else
                    cancel(conf);
            },
            buildbtn: buildbtn,
            labelWidth: 250,
            saveText: last ? _('Finish') : _('Save & Next'),
            saveIconCls: last ? 'exit' : 'next',
            cancel: cancel,
            uilevel: 'expert',
            help: function() {
                new tvheadend.help(_('Wizard - initial configuration and tutorial'), 'config_wizard.html');
            }
        });
    }

    tvheadend.wizard = page;
    tvheadend.Ajax({
        url: 'api/wizard/' + page + '/load',
        params: {
            meta: 1
        },
        success: build,
        failure: function(response, options) {
            Ext.MessageBox.alert(_('Unable to obtain wizard page!'), response.statusText);
        }
    });

};