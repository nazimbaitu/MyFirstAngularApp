using ShopKhata.Domain.Common;
using ShopKhata.Domain.Entities;

namespace ShopKhata.Tests;

public sealed class ShopSettingsTests
{
    [Fact]
    public void WhatsApp_payment_template_is_stored_and_limited()
    {
        var settings = new ShopSettings(Guid.NewGuid());

        settings.Update("PKR", null, null, "Payment for {customerName}");

        Assert.Equal("Payment for {customerName}", settings.WhatsAppPaymentTemplate);
        Assert.Throws<DomainException>(() => settings.Update("PKR", null, null, new string('x', 1001)));
    }
}
