import React from 'react';
import { shallow } from 'enzyme';
import Stock from '../../../components/Stock';

describe.skip('Stock', () => {
  const mockProps = {
    symbol: 'FB',
    name: 'Facebook Inc.',
    price: 200,
    color: 'hsl(0, 50%, 70%)',
    handleRemove: jest.fn(),
    disabled: false
  }

  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<Stock {...mockProps}/>);
  });

  afterEach(() => {
    mockProps.handleRemove.mockReset();
  });

  it('sets the color', () => {
    expect(wrapper.prop('style')).toEqual({borderColor: mockProps.color});
  });

  it('displays the symbol', () => {
    expect(wrapper.find('.stock__symbol').text()).toBe(mockProps.symbol);
  });

  it('displays the name', () => {
    expect(wrapper.find('.stock__name').text()).toBe(mockProps.name);
  });

  it('displays the price', () => {
    expect(wrapper.find('.stock__price').text()).toBe(mockProps.price.toString());
  });

  it('has the button with correct name and classes', () => {
    expect(wrapper.find('button.stock__remove')).toHaveLength(1);
    expect(wrapper.find('.stock__remove').prop('name')).toBe(mockProps.symbol);
    expect(wrapper.find('.stock__remove').prop('className').includes('disabled')).toBe(false);
  });

  it('the button uses the handler function', () => {
    expect(wrapper.find('button.stock__remove').prop('onClick')).toEqual(mockProps.handleRemove);
    wrapper.find('.stock__remove').simulate('click');
    expect(mockProps.handleRemove).toBeCalled();
  });

  describe('disabled button', () => {
    beforeEach(() => {
      wrapper.setProps({ disabled: true });
    });

    it('the button has className "disabled"', () => {
      expect(wrapper.find('.stock__remove').prop('className').includes('disabled')).toBe(true);
    });

    it('the button is not attached to handleRemove', () => {
      expect(wrapper.find('button.stock__remove').prop('onClick')).not.toEqual(mockProps.handleRemove);
      wrapper.find('.stock__remove').simulate('click', { preventDefault() {} });
      expect(mockProps.handleRemove).not.toBeCalled();
    });
  });
});