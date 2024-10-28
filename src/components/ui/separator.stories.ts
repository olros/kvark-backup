import type { Meta, StoryObj } from '@storybook/react';
 
import { Separator } from './separator';
 
const meta: Meta<typeof Separator> = {
  component: Separator,
};
export default meta;
 
type Story = StoryObj<typeof Separator>;
 
export const Basic: Story = {};
 
// export const Primary: Story = {
//   args: {
//     primary: true,
//   },
// };