// ==UserScript==
// @name        fixbib
// @namespace   fixbib
// @description Fix common bib errors.
// @include     http://scholar.google.com/scholar.bib*
// @include     http://ieeexplore.ieee.org/xpl/downloadCitations
// @include     http://dl.acm.org/citation.cfm*
// @version     0.3
// @grant       none
// ==/UserScript==

(function () {
  var sites = {
    GOOGLE_SCHOLAR  : 0,
    ACM_DL          : 1,
    IEEE_XPLORE     : 2,
    UNKNOWN         : -1
  };

  var site = sites.UNKNOWN;
  if (location.hostname === 'scholar.google.com') {
    site = sites.GOOGLE_SCHOLAR;
  } else if (location.hostname === 'dl.acm.org') {
    site = sites.ACM_DL;
  } else if (location.hostname === 'ieeexplore.ieee.org') {
    site = sites.IEEE_XPLORE;
  }

  var orig, fixed;
  if (site === sites.GOOGLE_SCHOLAR || site === sites.ACM_DL) {
    var pres = document.getElementsByTagName('pre');
    var pre = pres[0];
    orig = pre.innerHTML;
  } else if (site === sites.IEEE_XPLORE) {
    orig = document.body.innerHTML.replace(/<br>\s+/g, '');
  }

  var colored = true;
  var cb, ce;
  if (colored == true) {
    cb = '<span style="color: blue;">';
    ce = '</span>';
  } else {
    cb = ce = '';
  }

  fixed = orig.replace(/journal={([^,]+), ([^}]*)},/, function (match, p1, p2, offset, string) {
    // Fix journal name.
    return 'journal={' + cb + p2 + ' ' + p1 + ce + '},';
  }).replace(/booktitle={([^}]+),\s*([^}]+)},/, function (match, p1, p2, offset, string) {
    // Fix booktitle field.
    var res = p2.replace(/(.*)\.\s*(.*)/, '$2 ' + p1 + ' $1');
    if (res === p2) {
      res = p2 + ' ' + p1;
    }
    if (/^Proceedings/.test(res) === false) {
      res = 'Proceedings of the ' + res.replace(/\s*Proceedings\s*/i, '').replace(/^the\s*/i, '');
    }
    return 'booktitle={' + cb + res + ce + '},';
  }).replace(/month={\s*(\w+)\s*}/, function (match, p1, offset, string) {
    // Use three-letter month macro.
    return 'month=' + cb + p1.substr(0, 3).toLowerCase() + ce + ',';
  }).replace(/pages={\s*(\d+)\s*-\s*(\d+)([^}]*)},/, function (match, p1, p2, p3, offset, string) {
    // Use en-dash to separate page numbers.
    return 'pages={' + cb + p1 + '--' + p2 + p3 + ce + '},';
  }).replace(/([A-Z]\.)([A-Z]\.)/g, cb + '$1 $2' + ce);
  // Separate first name intial and middle name initial in author names.

  // Quit if nothing is changed.
  if (fixed === orig) {
    return;
  }

  // Create new elements on page.
  if (site === sites.GOOGLE_SCHOLAR || site === sites.IEEE_XPLORE) {
    var newp = document.createElement('p');
    var newpcon = document.createTextNode('Fixed:');
    newp.appendChild(newpcon);
    var newpre = document.createElement('pre');
    //var newprecon = document.createTextNode(fixed);
    //newpre.appendChild(newprecon);
    newpre.innerHTML = fixed;

    document.body.appendChild(newp);
    document.body.appendChild(newpre);
  }
})();

// vim: set et sw=2 sts=2:
