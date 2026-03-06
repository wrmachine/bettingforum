/** Sum of vote values (upvote=1, downvote=-1). Use instead of _count.votes. */
export function sumVotes(votes: { value: number }[] | undefined): number {
  return (votes ?? []).reduce((s, v) => s + v.value, 0);
}
