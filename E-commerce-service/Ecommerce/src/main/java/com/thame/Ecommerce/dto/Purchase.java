package com.thame.Ecommerce.dto;

import com.thame.Ecommerce.entity.Address;
import com.thame.Ecommerce.entity.Customer;
import com.thame.Ecommerce.entity.Order;
import com.thame.Ecommerce.entity.OrderItem;
import lombok.Data;

import java.util.Set;

@Data
public class Purchase {
    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private Set<OrderItem> orderItems;
}
