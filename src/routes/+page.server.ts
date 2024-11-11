export async function load({ locals }) {
	const result = await locals.pb.collection('computers').getFullList({
		sort: '-updated',
		filter: `region.name = "killme232" && region.team.name = "lixelv's team"`
	});

	return { computers: result };
}
