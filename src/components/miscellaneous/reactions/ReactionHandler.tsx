import { Stack, styled } from '@mui/material';

import { Event, News } from 'types';

import Paper from 'components/layout/Paper';

import { EmojiPickerHandler } from './EmojiPickHandler';
import { EmojiShowAll } from './EmojiShowAll';
import { EmojiShowcase } from './EmojiShowcase';

const EmojiPaper = styled(Paper)(({ theme }) => ({
  padding: '4px',
  borderRadius: '8px',
  backgroundColor: theme.palette.background.paper,
}));

export type ReactionHandlerProps = {
  data: News | Event;
  content_type: 'news' | 'event';
};

export const ReactionHandler = ({ data, content_type }: ReactionHandlerProps) => {
  return (
    <Stack alignItems='center' direction='row' spacing={1}>
      {data.reactions?.length ? (
        <EmojiPaper>
          <EmojiShowcase content_type={content_type} data={data} />
        </EmojiPaper>
      ) : null}
      <EmojiPickerHandler content_type={content_type} data={data} />
      <EmojiShowAll content_type={content_type} data={data} />
    </Stack>
  );
};
