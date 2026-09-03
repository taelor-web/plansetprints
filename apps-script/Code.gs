/**
 * Plan Set Prints — Order Receiver
 * Saves plan files to Drive and sends ONE order email with the folder link.
 */

var ROOT_FOLDER_NAME = 'Plan Set Prints — Orders';
var NOTIFY_EMAIL     = 'plansetprints@gmail.com';
var UPLOAD_KEY       = 'psp-7f3k9x2m';

var MAX_FILES       = 12;
var MAX_BYTES       = 35 * 1024 * 1024;
var MAX_TOTAL_BYTES = 90 * 1024 * 1024;
var ALLOWED_EXTS    = ['pdf', 'dwg', 'dxf', 'tif', 'tiff'];

var NAVY = '#1e3f6f', ORANGE = '#e08a2a', BORDER = '#e0e2e6', MUTED = '#6b7280';

function doPost(e) {
  try {
    var p = JSON.parse(e.postData.contents);
    if (p.key !== UPLOAD_KEY) return jsonResponse({ ok: false, error: 'Unauthorized' });

    var customer = sanitize(p.customer || 'Unknown Customer');
    var company  = sanitize(p.company || '');
    var email    = String(p.email || '');
    var phone    = String(p.phone || '');
    var total    = String(p.total || '');
    var turn     = String(p.turnaround || '');
    var del      = String(p.delivery || '');
    var notes    = String(p.notes || '');
    var isRush   = !!p.isRush;
    var rows     = p.rows || [];
    var files    = p.files || [];

    // ---- Save files ----
    var folderUrl = '', fileHtml = '';
    if (files.length) {
      if (files.length > MAX_FILES) return jsonResponse({ ok: false, error: 'Too many files' });

      var totalBytes = 0;
      for (var i = 0; i < files.length; i++) {
        var nm = String(files[i].name || '');
        var ext = nm.split('.').pop().toLowerCase();
        if (ALLOWED_EXTS.indexOf(ext) === -1) return jsonResponse({ ok: false, error: 'Bad type: ' + ext });
        var sz = Math.floor((files[i].data || '').length * 0.75);
        if (sz > MAX_BYTES) return jsonResponse({ ok: false, error: 'Too large: ' + nm });
        totalBytes += sz;
      }
      if (totalBytes > MAX_TOTAL_BYTES) return jsonResponse({ ok: false, error: 'Order too large' });

      var root = getOrCreateFolder(DriveApp.getRootFolder(), ROOT_FOLDER_NAME);
      var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HHmm');
      var folder = root.createFolder(stamp + ' — ' + customer + (company ? ' (' + company + ')' : ''));

      for (var j = 0; j < files.length; j++) {
        var f = files[j];
        folder.createFile(Utilities.newBlob(
          Utilities.base64Decode(f.data),
          f.mimeType || 'application/octet-stream',
          f.name
        ));
        fileHtml += '<div style="padding:9px 14px;border:1px solid ' + BORDER + ';border-radius:6px;margin-bottom:6px;font-size:14px;">' +
          '<span style="font-weight:600;">' + esc(f.name) + '</span>' +
          '<span style="color:' + MUTED + ';font-size:12px;"> · ' + esc(f.size || '') +
          (f.pages ? ' · <strong style="color:' + NAVY + ';">' + f.pages + ' pages</strong>' : '') +
          '</span></div>';
      }
      folderUrl = folder.getUrl();
    } else {
      fileHtml = '<div style="padding:9px 14px;border:1px dashed ' + BORDER + ';border-radius:6px;font-size:13px;color:' + MUTED + ';">No files uploaded — customer will send separately</div>';
    }

    // ---- Build email ----
    var cell = 'padding:9px 14px;border-bottom:1px solid ' + BORDER + ';font-size:14px;color:#111;';
    var lbl  = 'padding:9px 14px;border-bottom:1px solid ' + BORDER + ';font-size:13px;color:' + MUTED + ';width:120px;';

    var h = '<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f4f5f7;padding:24px;">';
    h += '<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid ' + BORDER + ';">';

    h += '<div style="background:' + NAVY + ';padding:20px 24px;border-bottom:4px solid ' + ORANGE + ';">';
    h += '<div style="color:#fff;font-size:18px;font-weight:700;">New Print Order</div>';
    h += '<div style="color:rgba(255,255,255,.65);font-size:13px;margin-top:2px;">Plan Set Prints · ' +
         esc(Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMM d, yyyy h:mm a')) + '</div></div>';

    h += '<div style="padding:20px 24px 4px;font-size:12px;font-weight:700;color:' + MUTED + ';letter-spacing:.06em;">CUSTOMER</div>';
    h += '<table style="border-collapse:collapse;margin:0 24px 8px;width:calc(100% - 48px);">';
    h += '<tr><td style="' + lbl + '">Name</td><td style="' + cell + 'font-weight:600;">' + esc(customer) + '</td></tr>';
    if (company) h += '<tr><td style="' + lbl + '">Company</td><td style="' + cell + '">' + esc(company) + '</td></tr>';
    h += '<tr><td style="' + lbl + '">Email</td><td style="' + cell + '"><a href="mailto:' + esc(email) + '" style="color:' + NAVY + ';">' + esc(email) + '</a></td></tr>';
    h += '<tr><td style="' + lbl + '">Phone</td><td style="' + cell + '"><a href="tel:' + esc(phone) + '" style="color:' + NAVY + ';">' + esc(phone) + '</a></td></tr>';
    h += '</table>';

    h += '<div style="padding:16px 24px 4px;font-size:12px;font-weight:700;color:' + MUTED + ';letter-spacing:.06em;">FILES</div>';
    h += '<div style="margin:0 24px 8px;">' + fileHtml;
    if (folderUrl) {
      h += '<div style="margin-top:8px;"><a href="' + folderUrl + '" style="display:inline-block;background:' + ORANGE + ';color:#fff;text-decoration:none;padding:11px 20px;border-radius:6px;font-size:14px;font-weight:700;">Open files in Google Drive</a></div>';
    }
    h += '</div>';

    h += '<div style="padding:16px 24px 4px;font-size:12px;font-weight:700;color:' + MUTED + ';letter-spacing:.06em;">ORDER</div>';
    h += '<table style="border-collapse:collapse;margin:0 24px;width:calc(100% - 48px);">';
    h += '<tr style="background:#f7f8fa;">' +
         th('SIZE','left') + th('TYPE','left') + th('SHEETS','center') + th('COPIES','center') + th('SUBTOTAL','right') + '</tr>';
    for (var k = 0; k < rows.length; k++) {
      var r = rows[k];
      h += '<tr>' +
        '<td style="' + cell + 'font-weight:600;">' + esc(r.size) + '</td>' +
        '<td style="' + cell + '">' + esc(r.type) + '</td>' +
        '<td style="' + cell + 'text-align:center;">' + esc(r.sheets) + '</td>' +
        '<td style="' + cell + 'text-align:center;">' + esc(r.copies) + '</td>' +
        '<td style="' + cell + 'text-align:right;font-weight:600;">' + esc(r.sub) + '</td></tr>';
    }
    h += '</table>';

    h += '<div style="margin:14px 24px 0;background:' + NAVY + ';border-radius:8px;padding:14px 18px;">';
    h += '<table style="width:100%;"><tr><td style="color:rgba(255,255,255,.6);font-size:12px;">ESTIMATED TOTAL</td>';
    h += '<td style="text-align:right;color:#fff;font-size:24px;font-weight:800;">' + esc(total) + '</td></tr></table></div>';

    h += '<div style="padding:18px 24px 4px;font-size:12px;font-weight:700;color:' + MUTED + ';letter-spacing:.06em;">OPTIONS</div>';
    h += '<table style="border-collapse:collapse;margin:0 24px 16px;width:calc(100% - 48px);">';
    h += '<tr><td style="' + lbl + '">Turnaround</td><td style="' + cell + (isRush ? 'color:' + ORANGE + ';font-weight:700;' : '') + '">' + esc(turn) + '</td></tr>';
    h += '<tr><td style="' + lbl + '">Delivery</td><td style="' + cell + '">' + esc(del) + '</td></tr>';
    if (notes) h += '<tr><td style="' + lbl + '">Notes</td><td style="' + cell + '">' + esc(notes) + '</td></tr>';
    h += '</table>';

    h += '<div style="background:#f7f8fa;padding:14px 24px;border-top:1px solid ' + BORDER + ';font-size:12px;color:' + MUTED + ';">';
    h += 'Customer-generated estimate. Confirm file details and pricing before invoicing. Reply to reach the customer directly.</div>';
    h += '</div></div>';

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: 'Print Order — ' + customer + (company ? ' (' + company + ')' : '') + ' — ' + total,
      htmlBody: h,
      replyTo: email || NOTIFY_EMAIL
    });

    return jsonResponse({ ok: true, folderUrl: folderUrl });

  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonResponse({ ok: true, message: 'Plan Set Prints order endpoint is live.' });
}

function th(label, align) {
  return '<th style="text-align:' + align + ';padding:8px 14px;font-size:11px;color:' + MUTED +
         ';border-bottom:1px solid ' + BORDER + ';">' + label + '</th>';
}

function getOrCreateFolder(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function sanitize(s) {
  return String(s).replace(/[\\\/:*?"<>|]/g, '').trim().slice(0, 80);
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
