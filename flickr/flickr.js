if (Meteor.isClient)
{
	var tag = 'london',
		list = [];

	Template.feed.helpers({
		lists: function () {
			var all = Session.get('list'),
			chunks = [],
			size = 3;

			// All of this just so that we can chunk data in to rows and
			// clear them correctly for Bootstrap.
			while (all && (all.length > size)) {
				chunks.push({ row: all.slice(0, size)});
				all = all.slice(size);
			}

			chunks.push({row: all});
			return chunks;
		}
	});

	Template.item.helpers({
		selected: function() {
			var itemId = parseInt(this.id),
			selectedItem = Session.get('selected') ? Session.get('selected') : [],
			selected = '';

			// Scan over session items and set class to selected when we find
			// a match. Ideally this would be a collection _id.
			selectedItem.forEach(function(value) {
				var id = parseInt(value);

				if (id == itemId) {
					selected = 'selected';
				}
			});

			return selected;
		}
	});

	Template.feed.events({
		'click .thumbnail': function(event) {
			event.preventDefault();

			// Note: Sadly to update Session with have to clone a duplicate
			// and manipulate that. So we slice our session.
			var selection = event.currentTarget.id,
				saved = Session.get('selected') ? Session.get('selected') : [],
				clone = saved.slice(0);

			// Slight caveat with Meteor in that Sessions are only client-side.
			// Otherwise this would be sent to a Method call in Server.
			if (!event.currentTarget.classList.contains('selected')) {
				clone.push(selection);
				Session.setPersistent('selected', clone);
			} else {
				var removed = _.without(clone, selection);
				Session.setPersistent('selected', removed);
			}

		}
	});

	Meteor.call('flickr', tag, function(error, results) {
		var raw = results.content.replace(/\\'/g, "'"),
			feed = JSON.parse(raw);

		feed.items.forEach(function(value) {
			var link = value.link.split("/");

			// Flickr doesnt give us a unique id, so this had
			// to be snagged from the image url using underscore.
			value.id = _.chain(link)
				.without(link, "")
				.last()
				.value();

			list.push(value);
		});

		Session.setPersistent('list', list);
	});
}

if (Meteor.isServer)
{
	var path = 'http://api.flickr.com/services/feeds/photos_public.gne';

	Meteor.methods({
		flickr: function(tag) {
			this.unblock();
			return HTTP.call("GET", path, {
				params: {
					format: 'json',
					tags: tag,
					nojsoncallback: 1
				}
			});
		}
	});
}
