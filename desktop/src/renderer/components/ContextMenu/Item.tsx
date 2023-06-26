import 'react-contexify/dist/ReactContexify.css';
import { Menu, Item } from 'react-contexify';
import { useNFT } from 'renderer/contexts/NFTContext';
import { NFTMetadata } from 'renderer/types';

interface ItemContextMenuProps {
  id: string;
  item: NFTMetadata;
}
const ItemContextMenu = (props: ItemContextMenuProps) => {
  const { item, id } = props;
  const { moveToTop, moveToBottom, removeItem } = useNFT();

  return (
    <Menu animation={false} id={id}>
      <Item onClick={() => moveToTop(item)}>Move to Top</Item>
      <Item onClick={() => moveToBottom(item)}>Move to Bottom</Item>
      <Item onClick={() => removeItem(item)}>Remove</Item>
    </Menu>
  );
};

export default ItemContextMenu;
